import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test, { type TestContext } from 'node:test'
import { MemoryChannelAgentInteractionStore } from '@anvia/channel-agent'
import { createSupportApp, type SupportApp, type SupportAppOptions } from '../src/app.js'
import { loadConfig, type GoldenPathConfig } from '../src/config.js'
import {
  createFakeDiscordGateway,
  discordDirectMessage,
  startOtlpReceiver,
  startStubModel,
  type FakeDiscordGateway,
  type OtlpExport,
  type OtlpReceiver,
  type StubModel,
} from './fakes.js'
import { attributeNumber, attributeText, hasAttribute, parseTraceExport, type OtlpSpan } from './otlp.js'

const OPENAI_API_KEY = 'sk-test-never-exported'
const LENS_PUBLIC_KEY = 'pk-lens-smoke-test'
const LENS_SECRET_KEY = 'sk-lens-smoke-test-secret'
const DISCORD_CHANNEL_ID = '800000000000000001'
const CUSTOMER_ID = '700000000000000001'
const CONVERSATION_KEY = `channel:discord:900000000000000001:${DISCORD_CHANNEL_ID}:root`

test('an inbound Discord message runs the agent, calls the typed tool, answers, and exports one Lens trace', async (t) => {
  const { app, discord, model, telemetry } = await fixture(t)

  await app.service.start()
  assert.equal(discord.started, true, 'the bridge must start the adapter, which starts the gateway')

  await discord.emit(discordDirectMessage({ id: '700000000000000010', content: 'Where is order A-1042?' }))

  // Streaming sends a placeholder first and replaces it with the final answer.
  const deliveries = [
    ...discord.sent.map((delivery) => delivery.message.text),
    ...discord.edited.map((delivery) => delivery.message.text),
  ]
  assert.equal(discord.sent[0]?.channelId, DISCORD_CHANNEL_ID)
  assert.equal(discord.sent[0]?.message.text, 'Checking the order…')
  assert.match(deliveries.at(-1) ?? '', /A-1042.*shipped/s, 'the answer must come from the typed tool result')

  const toolTurn = model.requests.filter((request) => request.messages.some((message) => message.role === 'tool'))
  assert.equal(toolTurn.length, 1, 'exactly one model call must follow the tool result')

  await app.lens.flush()
  const exported = parseTraceExport(firstExport(telemetry.exports).body)

  const run = findSpan(exported.spans, 'agent.golden-path-support')
  assert.equal(attributeText(run, 'anvia.run.status'), 'completed')
  assert.equal(attributeText(run, 'anvia.trace.session_id'), CONVERSATION_KEY)
  assert.equal(attributeText(run, 'anvia.trace.user_id'), `discord:${CUSTOMER_ID}`)
  assert.ok((attributeNumber(run, 'anvia.usage.input_tokens') ?? 0) > 0, 'the run must report token usage')

  const generation = findSpan(exported.spans, 'model.turn.1')
  assert.equal(generation.parentSpanId, run.spanId)
  assert.equal(attributeText(generation, 'anvia.generation.model_id'), 'gpt-5.6-sol')

  const tool = findSpan(exported.spans, 'tool.lookup_order')
  assert.equal(tool.parentSpanId, run.spanId)
  assert.equal(attributeText(tool, 'anvia.tool.name'), 'lookup_order')

  // Safe capture keeps every prompt, tool argument, and result body out of Lens.
  assert.ok(!hasAttribute(tool, 'anvia.tool.args'), 'safe capture must omit tool arguments')
  assert.ok(!hasAttribute(tool, 'anvia.tool.result'), 'safe capture must omit tool results')

  const attributeValues = exported.spans.flatMap((span) => span.attributes.map((attribute) => JSON.stringify(attribute.value)))
  assert.ok(!attributeValues.join(' ').includes('A-1042'), 'order data must not appear in telemetry')
  assert.ok(!attributeValues.join(' ').includes(OPENAI_API_KEY), 'provider credentials must not appear in telemetry')
})

test('the operations monitor delivers a proactive report without starting the bridge', async (t) => {
  const { app, discord, telemetry } = await fixture(t)

  const report = await app.report()
  await app.notify(report)
  await app.lens.flush()

  assert.equal(discord.started, false, 'a proactive sender never starts a receive loop')
  assert.equal(discord.sent.length, 1)
  assert.match(discord.sent[0]?.message.text ?? '', /A-1043/, 'the report must cover open orders')

  const exported = parseTraceExport(firstExport(telemetry.exports).body)
  const run = findSpan(exported.spans, 'agent.golden-path-support')
  assert.equal(attributeText(run, 'anvia.trace.name'), 'open-orders-report')
  assert.equal(attributeText(run, 'anvia.trace.session_id'), 'ops-monitor')
  assert.equal(attributeText(run, 'anvia.trace.metadata.trigger'), 'manual')
  assert.equal(findSpan(exported.spans, 'tool.list_open_orders').parentSpanId, run.spanId)
})

type Fixture = Readonly<{
  app: SupportApp
  discord: FakeDiscordGateway
  model: StubModel
  telemetry: OtlpReceiver
}>

/**
 * Builds one app wired to in-process doubles. Every resource registers its own
 * cleanup before the next one starts, so a failure anywhere still releases the
 * event loop.
 */
async function fixture(t: TestContext): Promise<Fixture> {
  const model = await startStubModel()
  t.after(() => model.close())

  const telemetry = await startOtlpReceiver()
  t.after(() => telemetry.close())

  const dataDir = await mkdtemp(join(tmpdir(), 'golden-path-'))
  t.after(() => rm(dataDir, { recursive: true, force: true }))

  const discord = createFakeDiscordGateway()
  const options: SupportAppOptions = {
    config: testConfig({ modelBaseUrl: model.baseUrl, lensBaseUrl: telemetry.baseUrl, dataDir }),
    gateway: discord.gateway,
    interactionStore: new MemoryChannelAgentInteractionStore(),
  }
  const app = await createSupportApp(options)
  t.after(() => app.shutdown())

  return { app, discord, model, telemetry }
}

function testConfig(inputs: Readonly<{ modelBaseUrl: string; lensBaseUrl: string; dataDir: string }>): GoldenPathConfig {
  return loadConfig({
    OPENAI_API_KEY,
    OPENAI_BASE_URL: inputs.modelBaseUrl,
    DISCORD_BOT_TOKEN: 'discord-token-not-used-by-the-fake-gateway',
    DISCORD_CHANNEL_ID,
    CHANNEL_INTERACTION_DATABASE: join(inputs.dataDir, 'channel-interactions.sqlite'),
    AGENT_MEMORY_DATABASE: join(inputs.dataDir, 'agent-memory.sqlite'),
    ANVIA_LENS_BASE_URL: inputs.lensBaseUrl,
    ANVIA_LENS_PUBLIC_KEY: LENS_PUBLIC_KEY,
    ANVIA_LENS_SECRET_KEY: LENS_SECRET_KEY,
    ANVIA_LENS_SERVICE_NAME: 'golden-path-support',
    ANVIA_LENS_ENVIRONMENT: 'test',
  })
}

function firstExport(exports: readonly OtlpExport[]): { body: Buffer } {
  assert.equal(exports.length, 1, 'the run must export exactly one trace batch')
  const exported = exports[0]

  assert.equal(exported?.path, '/api/public/otel/v1/traces')
  assert.equal(exported?.method, 'POST')
  assert.equal(exported?.authorization, `Basic ${Buffer.from(`${LENS_PUBLIC_KEY}:${LENS_SECRET_KEY}`).toString('base64')}`)

  return { body: exported?.body ?? Buffer.alloc(0) }
}

function findSpan(spans: readonly OtlpSpan[], name: string): OtlpSpan {
  const span = spans.find((candidate) => candidate.name === name)
  assert.ok(span !== undefined, `expected a span named ${name}`)
  return span
}
