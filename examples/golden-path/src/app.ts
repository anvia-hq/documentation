import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Agent, type MemoryScope } from '@anvia/core'
import { sendChannelMessage, type SentChannelMessage } from '@anvia/channel'
import {
  createChannelAgent,
  SqliteChannelAgentInteractionStore,
  type ChannelAgentExecutor,
  type ChannelAgentInteractionStore,
  type ChannelAgentService,
  type ChannelAgentStream,
} from '@anvia/channel-agent'
import { DiscordChannel, discord, type DiscordGateway } from '@anvia/discord'
import { LensClient } from '@anvia/lens'
import { SqliteMemoryClient } from '@anvia/memory-sqlite'
import { OpenAIClient } from '@anvia/openai'
import type { GoldenPathConfig } from './config.js'
import { createOrderStore, type OrderStore } from './orders.js'
import { createOrderTools } from './tools.js'

const INSTRUCTIONS = [
  'You are the support agent for an order tracking service.',
  'Call lookup_order before answering any question about a specific order id, and never invent a status.',
  'Answer in at most three sentences and never disclose internal notes or credentials.',
].join(' ')

export type SupportApp = Readonly<{
  agent: Agent
  channel: DiscordChannel
  service: ChannelAgentService
  lens: LensClient
  orders: OrderStore
  /** Sends text to the configured channel without any inbound event. */
  notify(text: string): Promise<readonly SentChannelMessage[]>
  /** Asks the agent for a short operations report, traced as its own run. */
  report(): Promise<string>
  /** Stops the bridge, closes the interaction store, and flushes Lens. */
  shutdown(): Promise<void>
}>

export type SupportAppOptions = Readonly<{
  config: GoldenPathConfig
  /** Application-owned order data; the default is a small in-memory fixture. */
  orders?: OrderStore
  /** Replaces the Discord Gateway transport, for example in tests. */
  gateway?: DiscordGateway
  /** Replaces the durable interaction store, for example in tests. */
  interactionStore?: ChannelAgentInteractionStore
}>

export async function createSupportApp(options: SupportAppOptions): Promise<SupportApp> {
  const { config } = options
  const orders = options.orders ?? createOrderStore()

  // Both SQLite files live under data/ by default, so create their directories
  // before any client opens them.
  await mkdir(dirname(config.agent.memoryDatabase), { recursive: true })
  await mkdir(dirname(config.discord.interactionDatabase), { recursive: true })

  // One Lens client per process: it owns isolated trace and log providers and
  // never touches a global OpenTelemetry provider. Construction does no I/O.
  const lens = new LensClient({
    baseUrl: config.lens.baseUrl,
    publicKey: config.lens.publicKey,
    secretKey: config.lens.secretKey,
    serviceName: config.lens.serviceName,
    environment: config.lens.environment,
    release: config.lens.release,
    timeoutMs: 10_000,
  })

  const model = new OpenAIClient({
    apiKey: config.openai.apiKey,
    baseUrl: config.openai.baseUrl,
  }).completionModel({ modelId: config.openai.modelId, api: 'chat' })

  // Durable conversation memory also gives every channel conversation the
  // session identity that the Lens observer records.
  const memory = new SqliteMemoryClient({ path: config.agent.memoryDatabase })
  const memoryStore = memory.memoryStore()
  await memoryStore.ensure()

  const agent: Agent = new Agent({
    id: config.agent.id,
    name: config.agent.name,
    model,
    instructions: INSTRUCTIONS,
    maxTurns: 6,
    tools: createOrderTools(orders),
    memory: { store: memoryStore, savePolicy: 'turn' },
    observability: {
      // Safe capture keeps prompt and response bodies out of Lens by default.
      observers: { lens: lens.observer({ captureMode: 'safe' }) },
      primaryTrace: 'lens',
    },
  })

  const channel =
    options.gateway === undefined
      ? discord({
          token: config.discord.botToken,
          messageContentIntent: true,
          onError(error, context) {
            console.error(`[discord] ${context.operation} failed`, error)
          },
        })
      : new DiscordChannel({ gateway: options.gateway })

  let ownedInteractionStore: SqliteChannelAgentInteractionStore | undefined
  let interactionStore = options.interactionStore
  if (interactionStore === undefined) {
    // Paused approvals and questions survive a restart only when they are
    // stored outside process memory.
    ownedInteractionStore = new SqliteChannelAgentInteractionStore({ database: config.discord.interactionDatabase })
    interactionStore = ownedInteractionStore
  }

  const service = createChannelAgent({
    channel,
    agent: withConversationContext(agent),
    interactions: { store: interactionStore },
    streaming: { placeholder: 'Checking the order…', editIntervalMs: 900 },
    onError(error, context) {
      console.error(`[channel-agent] ${context.stage} failed`, error)
    },
  })

  let shutdownPromise: Promise<void> | undefined

  return {
    agent,
    channel,
    service,
    lens,
    orders,
    notify: (text) =>
      sendChannelMessage({
        channel,
        address: { platform: 'discord', conversationId: config.discord.conversationId },
        message: { text },
      }),
    async report() {
      const outcome = await agent.generate({
        prompt:
          'Summarize every open order for the operations channel in at most three lines. Include order ids and statuses.',
        trace: {
          name: 'open-orders-report',
          sessionId: 'ops-monitor',
          tags: ['proactive', 'operations'],
          metadata: { trigger: 'manual' },
        },
      })

      if (outcome.type !== 'response') {
        throw new Error(`The report run ended as "${outcome.type}" instead of producing a response.`)
      }

      return outcome.output
    },
    shutdown() {
      shutdownPromise ??= (async () => {
        try {
          // The service owns the adapter: stopping it detaches the gateway and
          // drains queued conversation work before the process exits.
          await service.stop()
        } finally {
          ownedInteractionStore?.close()
          await memory.close()
          await lens.close()
        }
      })()
      return shutdownPromise
    },
  }
}

/**
 * The bridge already derives one session per channel conversation. This adapter
 * forwards that session into the run's trace options, so Lens groups a
 * conversation into one session instead of unrelated traces.
 */
function withConversationContext(agent: Agent): ChannelAgentExecutor {
  const traceOf = (session?: MemoryScope) =>
    session === undefined
      ? undefined
      : { sessionId: session.sessionId, userId: session.userId, metadata: session.metadata }

  return {
    model: agent.model,
    memory: agent.memory,
    generate: (input) =>
      agent.generate({
        prompt: input.prompt,
        session: input.session,
        abortSignal: input.abortSignal,
        trace: traceOf(input.session),
      }),
    stream: (input): ChannelAgentStream =>
      agent.stream({
        prompt: input.prompt,
        session: input.session,
        abortSignal: input.abortSignal,
        trace: traceOf(input.session),
      }),
    // A resumed run is keyed by its stored continuation and receives no session
    // here, so it continues without conversation session context.
    resume: (continuation, response, settings) =>
      agent.resume(continuation, response, { abortSignal: settings.abortSignal }),
  }
}
