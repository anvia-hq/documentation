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
