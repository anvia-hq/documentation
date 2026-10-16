import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const anviaRoot = resolve(process.env.ANVIA_REPO ?? join(docsRoot, '..', 'anvia'))
const sdkRequire = createRequire(join(anviaRoot, 'package.json'))
const coreRequire = createRequire(join(anviaRoot, 'packages/core/package.json'))
const { register } = await import(pathToFileURL(sdkRequire.resolve('tsx/esm/api')).href)
register()
const tsModule = await import(pathToFileURL(sdkRequire.resolve('typescript')).href)
const ts = tsModule.default ?? tsModule
const coreURL = pathToFileURL(join(anviaRoot, 'packages/core/src/index.ts')).href
const { Agent, Usage, createTool, streamCompletion } = await import(coreURL)
const { Pipeline } = await import(
  pathToFileURL(join(anviaRoot, 'packages/core/src/pipeline/index.ts')).href
)
const { OpenAIClient } = await import(
  pathToFileURL(join(anviaRoot, 'packages/provider-openai/src/index.ts')).href
)
const { parseClientStreamRequest } = await import(
  pathToFileURL(join(anviaRoot, 'packages/client/src/index.ts')).href
)
const { z } = coreRequire('zod')

const capabilities = {
  streaming: true,
  tools: true,
  toolChoice: true,
  outputSchema: true,
  imageInput: false,
  documentInput: false,
  reasoning: false,
}
const completion = (choice) => ({
  choice,
  usage: Usage.empty(),
  rawResponse: null,
  finishReason: 'stop',
})
const textResponse = (text) => completion([{ type: 'text', text }])
const fakeModel = (overrides) => ({
  provider: 'docs-test',
  modelId: 'offline',
  capabilities,
  ...overrides,
})

async function blocks(path) {
  const markdown = await readFile(join(docsRoot, path), 'utf8')
  return [...markdown.matchAll(/^```(?:ts|typescript)([^\n]*)\n([\s\S]*?)^```\s*$/gm)].map(
    (match) => ({ flags: match[1], code: match[2] }),
  )
}

async function sourceEntry(specifier) {
  if (specifier.startsWith('node:')) return specifier
  if (!specifier.startsWith('@anvia/')) return pathToFileURL(coreRequire.resolve(specifier)).href
  const packageName = specifier.split('/').slice(0, 2).join('/')
  const directories = {
    '@anvia/core': 'core',
    '@anvia/openai': 'provider-openai',
    '@anvia/client': 'client',
    '@anvia/graph': 'graph',
    '@anvia/durable': 'durable',
  }
  const directory = directories[packageName]
  assert.ok(directory, `Add a source resolver for ${packageName}`)
  const packageRoot = join(anviaRoot, 'packages', directory)
  const manifest = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'))
  const subpath = specifier === packageName ? '.' : `.${specifier.slice(packageName.length)}`
  const entry = manifest.exports[subpath].types
    .replace(/^\.\/dist\//, './src/')
    .replace(/\.d\.ts$/, '.ts')
  return pathToFileURL(join(packageRoot, entry)).href
}

// Execute the actual Markdown code with offline application fixtures and assertions.
async function runExample(code, fixtures = '', assertions = '') {
  let output = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const parsed = ts.createSourceFile('example.mjs', output, ts.ScriptTarget.Latest, true)
  const importedNames = new Set()
  for (const statement of parsed.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const bindings = statement.importClause?.namedBindings
    if (bindings && ts.isNamedImports(bindings)) {
      for (const binding of bindings.elements) importedNames.add(binding.name.text)
    }
  }
  const helpers = ['Agent', 'Usage', 'createTool'].filter((name) => !importedNames.has(name))
  for (const match of [...output.matchAll(/from\s+(['"])([^'"]+)\1/g)]) {
    output = output.replace(match[0], `from ${JSON.stringify(await sourceEntry(match[2]))}`)
  }
  const directory = await mkdtemp(join(tmpdir(), 'anvia-doc-example-'))
  const path = join(directory, 'example.mjs')
  try {
    await writeFile(
      path,
      [
        "import assert from 'node:assert/strict'",
        `import { ${helpers.join(', ')} } from ${JSON.stringify(coreURL)}`,
        importedNames.has('z')
          ? ''
          : `import { z } from ${JSON.stringify(await sourceEntry('zod'))}`,
        fixtures,
        output,
        assertions,
      ].join('\n'),
    )
    await import(pathToFileURL(path).href)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

// Helpers injected as source so each fixture runs in the same module as the example.
const modelFixture = `
const capabilities = ${JSON.stringify(capabilities)}
const textResponse = (text) => ({ choice: [{ type: 'text', text }], usage: Usage.empty(), rawResponse: null })
const model = { provider: 'docs-test', modelId: 'offline', capabilities,
  completion: async () => textResponse('{"severity":"low","summary":"offline","needsFollowUp":false}') }
`

test('batch guide returns settled results and processes the later input', async () => {
  const example = (await blocks('sdk/advanced/parallel-and-batch/failures.md')).find((block) =>
    block.flags.includes('anvia-check'),
  )
  assert.ok(example)
  await runExample(
    example.code,
    '',
    `
    assert.deepEqual(results.map(item => item.status), ['completed', 'failed', 'completed'])
    assert.equal(failed.length, 1)
    assert.equal(results[2].output, 'password reset issue')
  `,
  )
})

test('offline evaluation guide produces a passing CI result', async () => {
  const example = (await blocks('sdk/evaluations.md')).find((block) =>
    block.flags.includes('anvia-check'),
  )
  assert.ok(example)
  await runExample(example.code, '', 'assert.equal(result.cases.passed, 2)')
})

test('guardrail guide blocks input and redacts final output', async () => {
  const example = (await blocks('sdk/guardrails.md')).find((block) =>
    block.flags.includes('anvia-check'),
  )
  assert.ok(example)
  await runExample(
    example.code,
    modelFixture,
    `
    model.completion = async () => textResponse('Token: DEMO_SECRET_123')
    const agent = new Agent({ id: 'guardrails-test', model, guardrails: supportPolicy })
    const blocked = await agent.generate({ prompt: 'INTERNAL_ONLY' })
    assert.equal(blocked.type, 'blocked')
    assert.equal(blocked.stage, 'input')
    const result = await agent.generate({ prompt: 'hello' })
    assert.equal(result.type, 'response')
    assert.equal(result.output, 'Token: [redacted]')
  `,
  )
})

test('observer guide receives a completed run', async () => {
  const example = (await blocks('sdk/observability.md')).find((block) =>
    block.flags.includes('anvia-check'),
  )
  assert.ok(example)
  await runExample(
    example.code,
    modelFixture,
    `
    const statuses = []
    const originalStart = telemetry.startRun
    telemetry.startRun = (args) => {
      const observer = originalStart(args)
      const originalEnd = observer.end
      observer.end = args => { statuses.push(args.status); return originalEnd(args) }
      return observer
    }
    const agent = new Agent({ id: 'observer-test', model, observability: { observers: { telemetry } } })
    await agent.generate({ prompt: 'hello' })
    assert.deepEqual(statuses, ['completed'])
  `,
  )
})

test('Mistral agent example uses the already parsed structured output', async () => {
  const examples = await blocks('sdk/providers/mistral/tools-and-schemas.md')
  const schema = examples
    .find((block) => block.code.includes('const incidentSchema ='))
    .code.split('const result =')[0]
  const agent = examples.find((block) => block.code.includes('const triageAgent =')).code
  await runExample(
    schema + agent,
    modelFixture + "\nconst incidentText = 'offline incident'",
    `
    assert.equal(result.type, 'response')
    assert.equal(result.output.severity, 'low')
  `,
  )
})

test('documented agent stream error boundary catches result rejection', async () => {
  const example = (await blocks('sdk/agents/errors-and-limits.md')).find((block) =>
    block.code.includes('recordRunFailure'),
  )
  assert.ok(example)
  await runExample(
    `async function handle() {\n${example.code}\n}`,
    `
    const input = { message: 'hello' }
    const supportAgent = new Agent({ id: 'stream-error', model: {
      provider: 'docs-test', modelId: 'offline', capabilities: ${JSON.stringify(capabilities)},
      completion: async () => { throw new Error('offline failure') },
      streamCompletion: async function* () { throw new Error('offline failure') },
    } })
    const recordRunFailure = () => {}
    const mapSupportError = error => error.message
  `,
    "assert.equal(await handle(), 'offline failure')",
  )
})

test('custom browser example sends a protocol-compatible request', async () => {
  const example = (await blocks('sdk/streaming/errors-and-cancellation.md')).find((block) =>
    block.code.includes("fetch('/api/chat'"),
  )
  assert.ok(example)
  let body
  // The browser example has no imports; run it with an offline fetch fixture.
  const code = ts.transpileModule(example.code, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
  await new AsyncFunction('messages', 'fetch', code)(
    [{ role: 'user', content: 'hello' }],
    async (_url, request) => {
      body = JSON.parse(request.body)
      return {}
    },
  )
  assert.equal(parseClientStreamRequest(body).type, 'messages')
})

test(
  'parallel branch failure aborts a sibling before the stage rejects',
  { timeout: 3_000 },
  async () => {
    let started
    const siblingStarted = new Promise((resolve) => {
      started = resolve
    })
    let siblingAborted = false
    const failing = new Pipeline({ id: 'failing', inputSchema: z.string() }).step({
      id: 'fail',
      run: async () => {
        await siblingStarted
        throw new Error('branch failed')
      },
    })
    const sibling = new Pipeline({ id: 'sibling', inputSchema: z.string() }).step({
      id: 'wait',
      run: async ({ abortSignal }) =>
        new Promise((resolve) => {
          abortSignal.addEventListener(
            'abort',
            () => {
              siblingAborted = true
              resolve('cancelled')
            },
            { once: true },
          )
          started()
        }),
    })
    await assert.rejects(
      new Pipeline({ id: 'parallel', inputSchema: z.string() })
        .parallel({ id: 'branches', branches: { failing, sibling } })
        .run({ input: 'hello' }),
      /branch failed/,
    )
    assert.equal(siblingAborted, true)
  },
)

test('OpenAI defaults to Chat Completions capabilities', () => {
  const model = new OpenAIClient({ apiKey: 'offline-placeholder' }).completionModel({
    modelId: 'offline',
  })
  assert.equal(model.capabilities.documentInput, false)
  assert.notEqual(model.capabilities.providerTools, true)
})

test('direct structured stream validation failure is not retried by default', async () => {
  let attempts = 0
  const model = fakeModel({
    completion: async () => textResponse('not-json'),
    streamCompletion: async function* () {
      attempts++
      yield { type: 'final', response: textResponse('not-json') }
    },
  })
  const events = []
  for await (const event of streamCompletion({
    model,
    prompt: 'hello',
    outputSchema: z.object({ n: z.number() }),
    retries: { maxAttempts: 3, initialDelayMs: 1, maxDelayMs: 1 },
  }))
    events.push(event)
  assert.equal(attempts, 1)
  assert.equal(events.at(-1).error.name, 'CompletionStructuredOutputError')
})

test('approval suspension is an onFinish status', async () => {
  const statuses = []
  const tool = createTool({
    name: 'protected',
    inputSchema: z.object({}),
    requiresApproval: true,
    execute: () => 'done',
  })
  const model = fakeModel({
    completion: async () =>
      completion([{ type: 'tool-call', toolName: 'protected', toolCallId: 'p1', input: {} }]),
  })
  const result = await new Agent({
    id: 'approval',
    model,
    tools: [tool],
    lifecycle: {
      onFinish: (event) => {
        statuses.push(event.status)
      },
    },
  }).generate({ prompt: 'hello' })
  assert.equal(result.type, 'interaction')
  assert.deepEqual(statuses, ['suspended'])
})

test('structured agent streaming buffers deltas until provider completion', async () => {
  let finished = false
  const model = fakeModel({
    completion: async () => textResponse('{"n":1}'),
    streamCompletion: async function* () {
      yield { type: 'text_delta', delta: '{"n":' }
      yield { type: 'text_delta', delta: '1}' }
      finished = true
      yield { type: 'final', response: textResponse('{"n":1}') }
    },
  })
  const stream = new Agent({
    id: 'structured-stream',
    model,
    outputSchema: z.object({ n: z.number() }),
  }).stream({ prompt: 'hello' })
  let sawText = false
  for await (const event of stream)
    if (event.type === 'text_delta') {
      sawText = true
      assert.equal(finished, true)
    }
  assert.equal(sawText, true)
  assert.deepEqual((await stream.result).output, { n: 1 })
})

test('Mistral answering agent uses automatic tool choice', async () => {
  const example = (await blocks('sdk/providers/mistral/tools-and-schemas.md')).find((block) =>
    block.code.includes("id: 'order-status'"),
  )
  assert.ok(example)
  await runExample(
    example.code,
    `
    let requests = 0
    const getOrder = createTool({ name: 'get_order', inputSchema: z.object({}), execute: () => 'shipped' })
    const model = { provider: 'docs-test', modelId: 'offline', capabilities: ${JSON.stringify(capabilities)},
      completion: async (request) => {
        requests++
        assert.equal(request.toolChoice, 'auto')
        return { choice: requests === 1
          ? [{ type: 'tool-call', toolName: 'get_order', toolCallId: 'order-1', input: {} }]
          : [{ type: 'text', text: 'Your order shipped.' }], usage: Usage.empty(), rawResponse: null }
      },
    }
  `,
    "assert.equal(result.type, 'response'); assert.equal(requests, 2)",
  )
})

test('memory example resolves approval before asserting a completed response', async () => {
  const example = (await blocks('sdk/memory/sessions.md')).find((block) =>
    block.code.includes('first = await supportAgent.generate'),
  )
  assert.ok(example)
  await runExample(
    example.code,
    `
    let generated = 0
    let resumed = 0
    const session = { sessionId: 'offline' }
    const supportAgent = {
      generate: async () => ++generated === 1
        ? { type: 'interaction', interaction: { type: 'tool-approval' }, continuation: {} }
        : { type: 'response', output: 'Tomorrow.' },
      resume: async (_continuation, decision) => {
        assert.equal(decision.approved, true)
        resumed++
        return { type: 'response', output: 'Invoice summary.' }
      },
    }
    const requestApproval = async () => ({ approved: true, reason: 'Authorized fixture approver.' })
  `,
    'assert.equal(generated, 2); assert.equal(resumed, 1)',
  )
})

test('tool error messages preserve embedded paths unless the application maps them', async () => {
  let requests = 0
  let toolOutput
  const tool = createTool({
    name: 'failing',
    inputSchema: z.object({}),
    execute: () => {
      throw new Error('Failure at /private/demo/config.ts')
    },
  })
  const model = fakeModel({
    completion: async (request) => {
      if (++requests === 1)
        return completion([{ type: 'tool-call', toolName: 'failing', toolCallId: 'f1', input: {} }])
      toolOutput = request.chatHistory.at(-1).content[0].output
      return textResponse('Unable to complete.')
    },
  })
  await new Agent({ id: 'tool-error', model, tools: [tool] }).generate({ prompt: 'hello' })
  assert.match(toolOutput.value, /\/private\/demo\/config\.ts/)
})

test('maxTurns permits the initial request plus the subsequent turn budget', async () => {
  const tool = createTool({ name: 'lookup', inputSchema: z.object({}), execute: () => 'done' })
  for (const maxTurns of [0, 1]) {
    let requests = 0
    const model = fakeModel({
      completion: async () => {
        requests++
        return completion([
          { type: 'tool-call', toolName: 'lookup', toolCallId: `t${requests}`, input: {} },
        ])
      },
    })
    await assert.rejects(
      new Agent({ id: 'turn-budget', model, tools: [tool], maxTurns }).generate({
        prompt: 'hello',
      }),
      { name: 'MaxTurnsError' },
    )
    assert.equal(requests, maxTurns + 1)
  }
})

test('eval expectations accept a negative control and reject unexpected invalids', async () => {
  const example = (await blocks('sdk/evaluations.md')).find(block => block.flags.includes('expectations-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    assert.equal(evalExitCode(result), 1)
    assert.equal(evalExitCode(result, expectations), 0)
    const invalid = await runEvalCli({ ...suite, target: async () => { throw new Error('offline') }, format: 'quiet' })
    assert.equal(evalExitCode(invalid, expectations), 2)
    assert.throws(() => assertEvalOutcomes(invalid, expectations.outcomes))
  `)
})

test('eval responder handles approvals and questions, and enforces its limit', async () => {
  const example = (await blocks('sdk/evaluations.md')).find(block => block.flags.includes('responder-example'))
  assert.ok(example)
  const verified = example.code.replace("console.log('response phase', phase)", 'observedPhases.push(phase)')
  await runExample(verified, 'const observedPhases = []', "assert.equal(output, 'done'); assert.deepEqual(observedPhases, [1, 2])")
  const limited = example.code.replace('maxResponses: 2', 'maxResponses: 1')
    .replace("const output = await target('Run the test', { id: 'interactions', input: 'Run the test' })", `
      const { AgentEvalSuspensionError } = await import(${JSON.stringify(await sourceEntry('@anvia/core/evals'))})
      await assert.rejects(target('Run the test', { id: 'interactions', input: 'Run the test' }), AgentEvalSuspensionError)
      const output = 'limit checked'
    `)
  await runExample(limited)
})


test('custom message metadata rejects invalid fields and non-JSON transforms', async () => {
  const example = (await blocks('sdk/messages/roles.md')).find(block => block.flags.includes('metadata-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    assert.equal(message.metadata.ticketId, 'T-1')
    assert.equal(ticketMessageSchema.safeParse({ ...stored, metadata: { tenantId: 1 } }).success, false)
    assert.equal(isMessage({ ...stored, metadata: { date: new Date() } }), false)
    assert.equal(ticketMessageSchema.safeParse({ role: 'user', content: 'ok' }).success, true)
    const transforming = createMessageSchema({ metadataSchema: z.object({ value: z.string().transform(() => new Date()) }) })
    assert.equal(transforming.safeParse({ role: 'user', content: 'ok', metadata: { value: 'today' } }).success, false)
  `)
})

test('continuation handler validates answers before claiming and resuming', async () => {
  const example = (await blocks('sdk/agents/interactions.md')).find(block => block.flags.includes('continuation-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    const interaction = { type: 'tool-question', id: 'i1', toolName: 'ask', toolCallId: 'c1', internalCallId: 'c1',
      questions: [{ id: 'route', text: 'Queue?', choices: [{ label: 'Support', value: 'support' }], allowCustom: false }] }
    const continuation = { version: 1, agentId: 'agent', sourceRunId: 'run', interaction, state: {} }
    let claims = 0, resumes = 0
    const deps = {
      load: async () => ({ continuation, ownerId: 'operator', tenantId: 'demo', expiresAt: Date.now() + 10000, revision: 'r1' }),
      authorize: async actor => { if (actor !== 'operator') throw new Error('Forbidden') },
      claim: async () => { claims++; return claims === 1 },
      resume: async () => { resumes++; return 'resumed' },
    }
    for (const body of [
      { type: 'tool-approval', approved: true },
      { type: 'tool-question', answers: [] },
      { type: 'tool-question', answers: [{ questionId: 'route', value: 'support' }, { questionId: 'route', value: 'support' }] },
      { type: 'tool-question', answers: [{ questionId: 'route', value: 'other' }] },
      { type: 'tool-question', answers: [{ questionId: 'unknown', value: 'support' }] },
    ]) await assert.rejects(continueInteraction('operator', 'i1', body, deps))
    const body = { type: 'tool-question', answers: [{ questionId: 'route', value: 'support' }] }
    await assert.rejects(continueInteraction('outsider', 'i1', body, deps), /Forbidden/)
    assert.equal(claims, 0)
    assert.equal(await continueInteraction('operator', 'i1', body, deps), 'resumed')
    await assert.rejects(continueInteraction('operator', 'i1', body, deps), /already claimed/)
    assert.equal(resumes, 1)
  `)
})


test('generic stream example validates SSE and handles JSONL, HTTP and parsing failures', async () => {
  const example = (await blocks('sdk/streaming/server-transport.md')).find(block => block.flags.includes('generic-transport-example'))
  assert.ok(example)
  await runExample(example.code, '', String.raw`
    assert.deepEqual(received, [{ type: 'progress', completed: 1 }])
    async function collect(body, status = 200) {
      const client = createFetchEventTransport({ endpoint: 'https://example.invalid',
        fetch: async () => new Response(body, { status }), mapEvent: event => eventSchema.parse(event) })
      const values = []
      for await (const value of client.send({ request: {} })) values.push(value)
      return values
    }
    assert.deepEqual(await collect('{"type":"progress","completed":2}\n'), [{ type: 'progress', completed: 2 }])
    await assert.rejects(collect('not-json'), SyntaxError)
    await assert.rejects(collect('{"type":"progress","completed":"bad"}'))
    await assert.rejects(collect('private error', 503), error => error instanceof EventStreamHttpError && error.body === 'private error')
    const { readJsonlStream, createDirectEventTransport } = await import(${JSON.stringify(await sourceEntry('@anvia/client/transport'))})
    let cancelled = false
    const body = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('1\n2\n')) }, cancel() { cancelled = true } })
    for await (const value of readJsonlStream(body)) { assert.equal(value, 1); break }
    assert.equal(cancelled, true)
    const abort = new AbortController()
    let closed = false
    const direct = createDirectEventTransport({ handler: async function* () { try { yield 1; yield 2 } finally { closed = true } } })
    const values = []
    for await (const value of direct.send({ request: {}, abortSignal: abort.signal })) { values.push(value); abort.abort() }
    assert.deepEqual(values, [1])
    assert.equal(closed, true)
    let forwarded = false
    const aborting = createFetchEventTransport({ endpoint: 'https://example.invalid', fetch: async (_input, init) => {
      forwarded = init.signal === abort.signal
      init.signal.throwIfAborted()
      return new Response('')
    } })
    await assert.rejects(async () => { for await (const event of aborting.send({ request: {}, abortSignal: abort.signal })) void event })
    assert.equal(forwarded, true)
  `)
})

test('client error helpers distinguish masking from normalization', async () => {
  const example = (await blocks('packages/client/protocol-and-state.md')).find(block => block.flags.includes('client-errors-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    assert.deepEqual(publicError, { message: 'An unexpected error occurred.' })
    assert.equal(localError.name, 'ApplicationError')
    const original = new Error('private details')
    assert.equal(normalizeClientError(original), original)
  `)
})


test('custom model maps controls, applies defaults, and reports input context usage', async () => {
  const example = (await blocks('sdk/providers/model-boundary.md')).find(block => block.flags.includes('custom-model-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    assert.equal(result.output, 'long')
    assert.equal(result.contextUsage.usedPercent, 2)
    assert.equal((await generateCompletion({ model, prompt: 'Explain' })).output, 'short')
    await assert.rejects(generateCompletion({ model, prompt: 'Explain', controls: { responseStyle: 'invalid' } }))
    assert.throws(() => defineCompletionModelControls({ style: { type: 'select', label: 'Style', options: ['x', 'x'] } }))
    assert.throws(() => defineCompletionModelControls({ style: { type: 'select', label: 'Style', options: ['x'], defaultValue: 'y' } }))
    const { calculateContextUsage } = await import(${JSON.stringify(await sourceEntry('@anvia/core/completion'))})
    assert.equal(resolveModelContextLimits('missing', {}), undefined)
    assert.equal(calculateContextUsage(result.usage, undefined), undefined)
    assert.equal(calculateContextUsage(Usage.empty(), { modelId: 'offline', context: limits }), undefined)
    const over = calculateContextUsage({ ...Usage.empty(), inputTokens: 2000 }, { modelId: 'offline', context: limits })
    assert.equal(over.usedTokens, 2000)
    assert.equal(over.usedPercent, 100)
    assert.equal(over.remainingTokens, 0)
    assert.equal(withContextUsage({ choice: [], usage: Usage.empty(), rawResponse: null }, undefined).contextUsage, undefined)
  `)
})


test('provider error example respects retry kinds and stops after streaming progress', async () => {
  const example = (await blocks('sdk/structured-output/validation-errors.md')).find(block => block.flags.includes('provider-error-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    assert.equal(attempts, 2)
    assert.equal(diagnostic.code, 'ANVIA_COMPLETION_PROVIDER_OUTPUT')
    for (const kind of ['invalid-response', 'filtered-tool-call']) {
      let calls = 0
      const failure = kind === 'filtered-tool-call' ? { kind, finishReason: 'content-filter' } : { kind }
      const failing = { ...model, completion: async () => { calls++; throw new CompletionProviderOutputError(failure) } }
      await assert.rejects(generateCompletion({ model: failing, prompt: 'test', retries: { maxAttempts: 2, initialDelayMs: 0, maxDelayMs: 0 } }), CompletionProviderOutputError)
      assert.equal(calls, 1)
    }
    const { streamCompletion } = await import(${JSON.stringify(await sourceEntry('@anvia/core/completion'))})
    let calls = 0
    const streaming = { ...model, capabilities: { ...model.capabilities, streaming: true }, streamCompletion: async function* () {
      calls++
      yield { type: 'text_delta', delta: 'partial' }
      throw new CompletionProviderOutputError({ kind: 'incomplete-stream' })
    } }
    const events = []
    for await (const event of streamCompletion({ model: streaming, prompt: 'test', retries: { maxAttempts: 2, initialDelayMs: 0, maxDelayMs: 0 } })) events.push(event)
    assert.equal(calls, 1)
    assert.equal(events.at(-1).type, 'error')
  `)
})

test('adapter and tool errors match their documented boundaries', async () => {
  const { AgentToolSuspensionError, AgentRunBlockedError, AgentStreamClosedError } = await import(coreURL)
  const { ToolCallError, ToolJsonError, ToolNotFoundError, ToolResultSerializationError, normalizeToolResultOutput } = await import(await sourceEntry('@anvia/core/tool'))
  const { PipelineAgentSuspensionError } = await import(await sourceEntry('@anvia/core/pipeline'))
  const { agentEvalTarget, AgentEvalSuspensionError } = await import(await sourceEntry('@anvia/core/evals'))
  const guarded = createTool({ name: 'guarded', description: 'Synthetic approval', inputSchema: z.object({}), requiresApproval: true, execute: () => 'done' })
  const agent = new Agent({ id: 'adapter-errors', model: fakeModel({ completion: async () => completion([
    { type: 'tool-call', toolCallId: 'c1', toolName: 'guarded', input: {} },
  ]) }), tools: [guarded] })
  const request = { prompt: 'test' }
  assert.equal((await agent.generate(request)).type, 'interaction')
  await assert.rejects(agent.asTool({ name: 'child', suspension: 'reject' }).call(request), AgentToolSuspensionError)
  const pipeline = new Pipeline({ id: 'adapter-errors', inputSchema: z.string() }).agent({ id: 'agent', agent, suspension: 'reject', request: ({ input }) => ({ prompt: input }) })
  await assert.rejects(pipeline.run({ input: 'test' }), PipelineAgentSuspensionError)
  const target = agentEvalTarget({ agent, request: ({ input }) => ({ prompt: input }) })
  await assert.rejects(target('test', { id: 'case', input: 'test' }), AgentEvalSuspensionError)
  await assert.rejects(agent.callTool('missing', '{}'), ToolNotFoundError)
  await assert.rejects(agent.callTool('guarded', '{'), ToolJsonError)
  const broken = createTool({ name: 'broken', description: 'Invalid output', inputSchema: z.object({}), execute: () => new Date() })
  const registry = new Agent({ id: 'registry', model: agent.model, tools: [broken] })
  assert.throws(() => normalizeToolResultOutput(new Date()), ToolResultSerializationError)
  await assert.rejects(registry.callTool('broken', '{}'), error => error instanceof ToolCallError && error.cause instanceof ToolResultSerializationError)
  const { defineGuardrailPolicy, guardrails } = await import(await sourceEntry('@anvia/core/guardrails'))
  const blocked = new Agent({ id: 'blocked-adapter', model: agent.model, guardrails: defineGuardrailPolicy({ input: [guardrails.blockText({ id: 'block-test', boundary: 'input', patterns: ['BLOCK'], reason: 'test' })] }) })
  assert.equal((await blocked.generate({ prompt: 'BLOCK' })).type, 'blocked')
  await assert.rejects(blocked.asTool({ name: 'blocked', suspension: 'reject' }).call({ prompt: 'BLOCK' }), AgentRunBlockedError)
  const blockedPipeline = new Pipeline({ id: 'blocked-pipeline', inputSchema: z.string() }).agent({ id: 'agent', agent: blocked, suspension: 'reject', request: ({ input }) => ({ prompt: input }) })
  await assert.rejects(blockedPipeline.run({ input: 'BLOCK' }), AgentRunBlockedError)
  const blockedTarget = agentEvalTarget({ agent: blocked, request: ({ input }) => ({ prompt: input }) })
  await assert.rejects(blockedTarget('BLOCK', { id: 'blocked', input: 'BLOCK' }), AgentRunBlockedError)
  const streamingAgent = new Agent({ id: 'closed-stream', model: fakeModel({ completion: async () => textResponse('done'), streamCompletion: async function* () { yield { type: 'final', response: textResponse('done') } } }) })
  const stream = streamingAgent.stream({ prompt: 'test' })
  for await (const event of stream) void event
  await stream.result
  assert.throws(() => stream.steer('late'), AgentStreamClosedError)
})


test('memory key example separates user/tenant scopes and applies one key to all operations', async () => {
  const example = (await blocks('sdk/memory/custom-stores.md')).find(block => block.flags.includes('memory-key-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    const scope = { sessionId: 's', userId: 'u', metadata: { tenantId: 't' } }
    assert.notEqual(keyFor(scope), keyFor({ ...scope, userId: 'other' }))
    assert.notEqual(keyFor(scope), keyFor({ ...scope, metadata: { tenantId: 'other' } }))
    assert.equal(keyFor({ sessionId: 's' }), '["s",null,null]')
    assert.equal(createMemoryScopeKey({ scope: { sessionId: 's', metadata: { organization: { id: 'org' } } }, metadataKeys: ['organization.id'] }), '["s",null,"org"]')
    assert.equal(createMemoryScopeKey({ scope, includeUserId: false }), '["s"]')
    assert.notEqual(createMemoryScopeKey({ scope, metadataKeys: ['tenantId', 'missing'] }), createMemoryScopeKey({ scope, metadataKeys: ['missing', 'tenantId'] }))
    const keys = []
    const backend = {
      load: async key => { keys.push(key); return [] },
      append: async input => { keys.push(input.key) },
      clear: async key => { keys.push(key) },
      recordError: async input => { keys.push(input.key) },
      snapshot: async key => { keys.push(key); return { revision: 'r1', messages: [] } },
      replacePrefix: async input => { keys.push(input.key); return { status: 'committed' } },
      listConversations: async () => [],
      getConversation: async ({ ref }) => { keys.push(ref); return undefined },
    }
    const store = createProductMemoryStore(backend)
    await store.load({ scope })
    await store.append({ scope, messages: [], runId: 'r', turn: 1 })
    await store.clear({ scope })
    await store.recordError({ scope, messages: [], runId: 'r', error: new Error('synthetic') })
    await store.compaction.snapshot({ scope })
    await store.compaction.replacePrefix({ scope, revision: 'r1', messageCount: 1, runId: 'r', replacement: { role: 'system', content: 'summary', metadata: { anvia: { memoryCompaction: { version: 1, compactedMessageCount: 1 } } } } })
    await store.inspector.getConversation({ ref: keyFor(scope) })
    assert.deepEqual(keys, Array(7).fill(keyFor(scope)))
  `)
})


test('Core reference distance example verifies zero vectors and dimensional boundaries', async () => {
  const example = (await blocks('packages/core/api-reference.md')).find(block => block.flags.includes('embedding-utilities-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    assert.equal(similarity, 1)
    assert.equal(distance, 5)
    assert.equal(cosineSimilarity([0, 0], [1, 0]), 0)
    assert.throws(() => euclideanDistance([1], [1, 2]), /dimension mismatch/)
  `)
})

test('Graph reference schema example rejects unsafe graph property values', async () => {
  const example = (await blocks('packages/graph/api-reference.md')).find(block => block.flags.includes('graph-schema-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    assert.equal(properties.id, 'synthetic-person')
    for (const value of [null, { nested: true }, [1, 'mixed'], Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => parseGraphProperties({ value }, 'Person'))
    }
    assert.throws(() => parseGraphProperties({ __anvia_internal: 'private' }, 'Person'))
  `)
})

test('OpenAI decision example preserves confidence and maps refusals to application questions', async () => {
  const example = (await blocks('packages/openai/decisions.md')).find(block => block.flags.includes('openai-decision-example'))
  assert.ok(example)
  await runExample(example.code, '', `
    const { OpenAIClient } = await import(${JSON.stringify(await sourceEntry('@anvia/openai'))})
    let refused = false
    const requests = []
    const client = new OpenAIClient({ client: { decisions: { create: async (request, options) => {
      requests.push({ request, options })
      return { model: GPT_6_LUNA,
        answers: [refused ? { type: 'refusal', name: 'q0' } : {
          type: 'choice', name: 'q0', choice: 'billing', confidence: 0.7,
          probabilities: [{ value: 'billing', probability: 0.8 },
            { value: 'technical', probability: 0.1 }, { value: 'general', probability: 0.1 }],
        }], usage: { input_tokens: 12, output_tokens: 3, total_tokens: 15,
          input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 },
          output_tokens_details: { reasoning_tokens: 0 } } }
    } } } })
    const answer = await routeTicket(client, 'Refund my duplicate payment')
    assert.equal(answer.choice, 'billing')
    assert.equal(answer.confidence, 0.7)
    assert.equal(requests[0].options.maxRetries, 0)
    assert.deepEqual(JSON.parse(requests[0].request.input), { message: 'Refund my duplicate payment' })
    refused = true
    await assert.rejects(routeTicket(client, 'Another request'), error => {
      assert.equal(error.name, 'DecisionRefusalError')
      assert.deepEqual(error.questionNames, ['department'])
      assert.equal(error.rawResponse.answers[0].type, 'refusal')
      return true
    })
  `)
})

test('Pipeline route example runs only the chosen branch and keeps the decision', async () => {
  const example = (await blocks('sdk/pipelines/decisions-and-routing.md')).find((block) =>
    block.flags.includes('pipeline-route-example'),
  )
  assert.ok(example)
  await runExample(example.code, '', `
    const requests = []
    const model = {
      provider: 'docs-test',
      modelId: 'offline',
      capabilities: {
        questionSupport: { choice: 'native', 'multi-label': 'native', score: 'native', check: 'native' },
        mixedQuestions: true,
      },
      async decision(request, options) {
        requests.push({ request, options })
        const [name] = Object.keys(request.questions)
        return {
          answers: { [name]: { type: 'choice', choice: 'technical', confidence: 0.9 } },
          usage: { ...Usage.empty(), inputTokens: 8, outputTokens: 1, totalTokens: 9 },
          rawResponse: {},
        }
      },
    }
    const triage = createTriage(model)
    const controller = new AbortController()
    const started = []
    const { output } = await triage.run({
      input: { subject: 'App crashes', body: 'The app crashes on login.' },
      abortSignal: controller.signal,
      observer: { onEvent(event) { if (event.type === 'stage_started') started.push(event.path.join('/')) } },
    })
    assert.equal(output.branch, 'technical')
    assert.deepEqual(output.output, { queue: 'engineering', subject: 'App crashes' })
    assert.equal(output.answer.confidence, 0.9)
    assert.equal(output.usage.totalTokens, 9)
    assert.deepEqual(started, ['department', 'department/technical', 'department/technical/open-incident'])
    assert.deepEqual(requests[0].request.state, { subject: 'App crashes', body: 'The app crashes on login.' })
    assert.equal(requests[0].options.abortSignal, controller.signal)
    const labels = triage.graph().edges.flatMap((edge) => (edge.label === undefined ? [] : [edge.label]))
    assert.deepEqual(labels.sort(), ['billing', 'technical'])
  `)
})

// Durable imports Core's internal registration state through workspace exports. Use the same
// built Agent instance in these integration fixtures rather than mixing source/dist WeakMaps.
const durableModelFixture = modelFixture + `
const { Agent: DurableAgent } = await import(${JSON.stringify(pathToFileURL(join(anviaRoot, 'packages/core/dist/index.js')).href)})
`

test('durable goal example verifies completion and preserves it across reopen', { timeout: 10000 }, async () => {
  const example = (await blocks('packages/durable/goals.md')).find(block => block.flags.includes('durable-goal-example'))
  assert.ok(example)
  const directory = await mkdtemp(join(tmpdir(), 'anvia-doc-goal-'))
  try {
    await runExample(example.code, durableModelFixture, `
      const builder = new DurableAgent({ id: 'builder', model, maxTurns: 1 })
      let checks = 0
      const verify = async (criteria, signal) => {
        signal.throwIfAborted()
        assert.deepEqual(criteria, ['Synthetic acceptance check passes'])
        checks++
        return { passed: true, blocked: false, artifactHash: 'verified-artifact',
          summary: 'Acceptance check passed', nextAction: '', evidence: ['synthetic-check:pass'] }
      }
      const opened = await openGoalRuntime(builder, ${JSON.stringify(join(directory, 'goals.sqlite'))}, verify)
      let goalId
      try {
        const goal = await opened.runtime.submitGoal(opened.definition, {
          sessionId: 'docs-goal', requestId: 'request-1', objective: 'Complete synthetic work',
          acceptanceCriteria: ['Synthetic acceptance check passes'],
          limits: { maxSessions: 2, maxTotalModelTurns: 3, maxConsecutiveNoProgressSessions: 1 },
        })
        goalId = goal.id
        const result = await goal.result({ abortSignal: AbortSignal.timeout(5000) })
        assert.equal(result.sessions, 1)
        assert.equal(result.handoff.status, 'complete')
        assert.deepEqual(result.handoff.evidence, ['synthetic-check:pass'])
        assert.equal(checks, 1)
      } finally { await opened.runtime.close() }
      const reopened = await openGoalRuntime(builder, ${JSON.stringify(join(directory, 'goals.sqlite'))}, verify)
      try {
        const goal = await reopened.runtime.getTask(goalId)
        assert.equal((await goal.result()).handoff.status, 'complete')
        assert.equal(checks, 1)
      } finally { await reopened.runtime.close() }
    `)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('durable steering example deduplicates receipts and applies queued input', { timeout: 10000 }, async () => {
  const example = (await blocks('packages/durable/steering.md')).find(block => block.flags.includes('durable-steering-example'))
  assert.ok(example)
  await runExample(example.code, durableModelFixture, `
    const { DurableRuntime, DurableConflictError } = await import(${JSON.stringify(await sourceEntry('@anvia/durable'))})
    const { SqliteDurableStore } = await import(${JSON.stringify(await sourceEntry('@anvia/durable/sqlite'))})
    let release, started, calls = 0
    const pending = new Promise(resolve => { release = resolve })
    const firstCall = new Promise(resolve => { started = resolve })
    const agent = new DurableAgent({ id: 'steered', model: { ...model, completion: async () => {
      calls++
      if (calls === 1) { started(); await pending }
      return textResponse('done')
    } } })
    const runtime = await DurableRuntime.open({ store: new SqliteDurableStore(':memory:'),
      agents: [{ agent, version: '1' }] })
    try {
      const run = await runtime.submit({ agentId: agent.id, sessionId: 'docs-steer',
        requestId: 'run-1', prompt: 'Start work' })
      await firstCall
      const receipt = await steerRun(run, 'note-1')
      assert.deepEqual(receipt, { id: 'note-1', status: 'queued' })
      assert.deepEqual(await steerRun(run, 'note-1'), receipt)
      await assert.rejects(run.steer({ prompt: 'different' }, { requestId: 'note-1' }),
        DurableConflictError)
      release()
      await run.result({ abortSignal: AbortSignal.timeout(5000) })
      assert.equal((await run.status()).status, 'completed')
      assert.equal(calls, 2)
      const applied = runtime.events(run.id, 0).filter(event => event.type === 'steering_applied')
      assert.equal(applied.length, 1)
      assert.equal(applied[0].data.id, 'note-1')
    } finally { release(); await runtime.close() }
  `)
})

test('durable compaction example preserves canonical history and omits summary temperature', { timeout: 10000 }, async () => {
  const example = (await blocks('packages/durable/compaction.md')).find(block => block.flags.includes('durable-compaction-example'))
  assert.ok(example)
  await runExample(example.code, durableModelFixture, `
    const { DurableRuntime } = await import(${JSON.stringify(await sourceEntry('@anvia/durable'))})
    const { SqliteDurableStore } = await import(${JSON.stringify(await sourceEntry('@anvia/durable/sqlite'))})
    const requests = []
    const agent = new DurableAgent({ id: 'compacted', model: { ...model, completion: async request => {
      requests.push(request)
      return textResponse('Preserved synthetic fact')
    } } })
    const registration = compactingRegistration(agent)
    registration.compaction.trigger.afterTokens = 1
    registration.compaction.retention = { recentTurns: 0, recentToolTurns: 0 }
    const runtime = await DurableRuntime.open({ store: new SqliteDurableStore(':memory:'), agents: [registration] })
    try {
      const first = await runtime.submit({ agentId: agent.id, sessionId: 'docs-compaction',
        requestId: 'first', prompt: 'Remember the synthetic fact' })
      await first.result({ abortSignal: AbortSignal.timeout(5000) })
      const second = await runtime.submit({ agentId: agent.id, sessionId: 'docs-compaction',
        requestId: 'second', prompt: 'Recall the fact' })
      await second.result({ abortSignal: AbortSignal.timeout(5000) })
      const snapshot = await second.snapshot({ operations: false })
      assert.deepEqual(snapshot.operations, [])
      assert.ok(snapshot.run.history.some(message => JSON.stringify(message).includes('Remember the synthetic fact')))
      assert.ok(snapshot.run.contextCheckpoint.compactedMessageCount > 0)
      assert.equal(requests.length, 3)
      assert.equal(requests[1].temperature, undefined)
      assert.ok(runtime.events(second.id, 0).some(event => event.type === 'compaction_completed'))
    } finally { await runtime.close() }
  `)
})
