import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function verifyLensContracts({ test, blocks, runExample, sourceEntry,
  OpenAIClient, fakeModel, textResponse, capabilities, transpile }) {

  // Actual Lens documentation examples, with synthetic data and a loopback-only receiver.
  async function lensReceiver(reply = () => ({})) {
    const requests = []
    const server = createServer(async (request, response) => {
      const chunks = []
      for await (const chunk of request) chunks.push(chunk)
      const captured = {
        url: new URL(request.url, 'http://localhost'),
        authorization: request.headers.authorization,
        body: Buffer.concat(chunks).toString(),
      }
      requests.push(captured)
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(reply(captured)))
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    return {
      requests,
      baseUrl: `http://127.0.0.1:${server.address().port}`,
      close: () => new Promise((resolve, reject) => {
        server.closeAllConnections()
        server.close((error) => error ? reject(error) : resolve())
      }),
    }
  }

  const lensCredentials = { publicKey: 'docs-public', secretKey: 'docs-secret', serviceName: 'docs-offline' }

  function otlpAttributes(attributes = []) {
    return Object.fromEntries(attributes.map(({ key, value }) => [key,
      value.stringValue ?? value.intValue ?? value.doubleValue ?? value.boolValue]))
  }

  await test('Lens first-trace modules import the client and return an exported identity', { timeout: 10000 }, async () => {
    const examples = await blocks('lens/your-first-trace.md')
    const tracing = examples.find(block => block.code.includes('export const tracing'))
    const agent = examples.find(block => block.code.includes('const supportAgent'))
    const request = examples.find(block => block.code.includes('await supportAgent.generate'))
    assert.ok(tracing && agent && request)
    const directory = await mkdtemp(join(tmpdir(), 'lens-doc-modules-'))
    const receiver = await lensReceiver()
    const environment = {
      ANVIA_LENS_BASE_URL: receiver.baseUrl,
      ANVIA_LENS_PUBLIC_KEY: lensCredentials.publicKey,
      ANVIA_LENS_SECRET_KEY: lensCredentials.secretKey,
      ANVIA_LENS_SERVICE_NAME: lensCredentials.serviceName,
    }
    const previous = Object.fromEntries(Object.keys(environment).map(key => [key, process.env[key]]))
    Object.assign(process.env, environment)
    let tracingModule
    try {
      const tracingPath = join(directory, 'tracing.mjs')
      const modelPath = join(directory, 'model.mjs')
      await writeFile(tracingPath, transpile(tracing.code.replace("'@anvia/lens'",
        JSON.stringify(await sourceEntry('@anvia/lens')))))
      await writeFile(modelPath, `import { Usage } from ${JSON.stringify(await sourceEntry('@anvia/core'))}
        export const model = { provider: 'docs-test', modelId: 'offline',
          capabilities: ${JSON.stringify(capabilities)}, completion: async () => ({
            choice: [{ type: 'text', text: 'Offline observability response' }],
            usage: Usage.empty(), rawResponse: null, finishReason: 'stop' }) }`)
      tracingModule = await import(pathToFileURL(tracingPath).href)
      const observing = agent.code
        .replace("'./tracing'", JSON.stringify(pathToFileURL(tracingPath).href))
        .replace("'./model'", JSON.stringify(pathToFileURL(modelPath).href))
      const capture = `const responses = []
        const generate = supportAgent.generate.bind(supportAgent)
        supportAgent.generate = async request => {
          const response = await generate(request)
          responses.push(response)
          return response
        }`
      const verified = await runExample(observing + '\n' + capture + '\n' + request.code, '', `
        assert.equal(responses[0].type, 'response')
        assert.equal(responses[0].trace?.observer, 'tracing')
        assert.match(responses[0].trace.traceId, /^[0-9a-f]{32}$/)
        export const trace = responses[0].trace`)
      const spans = receiver.requests.filter(request => request.url.pathname.endsWith('/traces'))
        .flatMap(request => JSON.parse(request.body).resourceSpans ?? [])
        .flatMap(resource => resource.scopeSpans ?? []).flatMap(scope => scope.spans ?? [])
      assert.ok(spans.some(span => span.traceId === verified.trace.traceId &&
        span.spanId === verified.trace.observationId))
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
      await tracingModule?.lens.close()
      await receiver.close()
      await rm(directory, { recursive: true, force: true })
    }
  })

  await test('Lens evaluation example exports matching primary traces and result links', { timeout: 10000 }, async () => {
    const example = (await blocks('lens/evaluations/run-evaluations.md')).find(block => block.flags.includes('lens-eval-correlation-example'))
    assert.ok(example)
    const receiver = await lensReceiver()
    const originalModel = OpenAIClient.prototype.completionModel
    const environment = {
      ANVIA_LENS_BASE_URL: receiver.baseUrl,
      ANVIA_LENS_PUBLIC_KEY: lensCredentials.publicKey,
      ANVIA_LENS_SECRET_KEY: lensCredentials.secretKey,
      ANVIA_LENS_SERVICE_NAME: lensCredentials.serviceName,
      OPENAI_API_KEY: 'docs-offline',
      OPENAI_MODEL: 'docs-offline',
    }
    const previous = Object.fromEntries(Object.keys(environment).map(key => [key, process.env[key]]))
    Object.assign(process.env, environment)
    OpenAIClient.prototype.completionModel = () => fakeModel({ completion: async request =>
      textResponse(JSON.stringify(request).includes('How long are refunds') ? '30 days' : 'Workspace owners') })
    try {
      await runExample(example.code)
      const spans = receiver.requests.filter(request => request.url.pathname.endsWith('/traces'))
        .flatMap(request => JSON.parse(request.body).resourceSpans ?? [])
        .flatMap(resource => resource.scopeSpans ?? []).flatMap(scope => scope.spans ?? [])
      const logs = receiver.requests.filter(request => request.url.pathname.endsWith('/logs'))
        .flatMap(request => JSON.parse(request.body).resourceLogs ?? [])
        .flatMap(resource => resource.scopeLogs ?? []).flatMap(scope => scope.logRecords ?? [])
        .map(record => otlpAttributes(record.attributes))
      const results = logs.filter(record => record['anvia.eval.case.id'])
      assert.equal(results.length, 2)
      assert.deepEqual(results.map(record => record['anvia.eval.case.id']).sort(), ['billing-owner', 'refund-window'])
      for (const record of results) {
        assert.equal(record['anvia.eval.target.observer'], 'lens')
        assert.equal(record['anvia.eval.outcome'], 'pass')
        assert.ok(spans.some(span => span.traceId === record['anvia.eval.target.trace_id'] &&
          span.spanId === record['anvia.eval.target.observation_id']))
      }
      for (const request of receiver.requests) {
        assert.equal(request.authorization, `Basic ${Buffer.from('docs-public:docs-secret').toString('base64')}`)
      }
      const noPrimary = example.code.replace(", primaryTrace: 'lens'", '')
      assert.notEqual(noPrimary, example.code)
      await assert.rejects(runExample(noPrimary))
      const mismatchedName = example.code
        .replace('observers: { lens: observer }', 'observers: { custom: observer }')
        .replace("primaryTrace: 'lens'", "primaryTrace: 'custom'")
      assert.notEqual(mismatchedName, example.code)
      await assert.rejects(runExample(mismatchedName))
    } finally {
      OpenAIClient.prototype.completionModel = originalModel
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
      await receiver.close()
    }
  })

  await test('Lens dataset version example uses object options and preserves the published identity', { timeout: 10000 }, async () => {
    const example = (await blocks('lens/evaluations/datasets/versions.md')).find(block => block.flags.includes('lens-dataset-version-example'))
    assert.ok(example)
    const receiver = await lensReceiver(() => ({
      name: 'support-policy-cases', version: 'v2',
      items: [{ id: 'refund-window', input: 'How long?', expected: '30 days' }],
      meta: { page: 1, limit: 50, totalItems: 1, totalPages: 1 },
    }))
    try {
      await runExample(example.code,
        `const { LensClient } = await import(${JSON.stringify(await sourceEntry('@anvia/lens'))})
         const lens = new LensClient(${JSON.stringify({ ...lensCredentials, baseUrl: receiver.baseUrl })})`,
        `try {
          const dataset = await loadPolicyDataset(lens)
          assert.equal(dataset.name, 'support-policy-cases')
          assert.equal(dataset.version, 'v2')
          assert.deepEqual(dataset.items.map(item => item.id), ['refund-window'])
        } finally { await lens.close() }`)
      assert.equal(receiver.requests.length, 1)
      assert.equal(receiver.requests[0].url.pathname, '/api/public/datasets/support-policy-cases')
      assert.equal(receiver.requests[0].url.searchParams.get('version'), 'v2')
      assert.equal(receiver.requests[0].url.searchParams.get('limit'), '50')
      assert.equal(receiver.requests[0].authorization, `Basic ${Buffer.from('docs-public:docs-secret').toString('base64')}`)
    } finally { await receiver.close() }
  })

  await test('Lens prompt reference example compiles the deployed version without implicit attribution', { timeout: 10000 }, async () => {
    const example = (await blocks('packages/lens/api-reference.md')).find(block => block.flags.includes('lens-prompt-example'))
    assert.ok(example)
    const receiver = await lensReceiver(() => ({
      name: 'support/answer', version: 3, type: 'text',
      template: 'Policy: {{question}}', messages: null, config: {},
      labels: ['production'], selector: { label: 'production' },
    }))
    try {
      await runExample(example.code,
        `const { LensClient, LensPromptCompilationError } = await import(${JSON.stringify(await sourceEntry('@anvia/lens'))})
         const lens = new LensClient(${JSON.stringify({ ...lensCredentials, baseUrl: receiver.baseUrl })})`,
        `try {
          const compiled = await compileSupportPrompt(lens, 'Refund window?')
          assert.deepEqual(compiled, { text: 'Policy: Refund window?', ref: { name: 'support/answer', version: 3 } })
          const prompt = await lens.promptClient().getPrompt({ name: 'support/answer' })
          assert.throws(() => prompt.compile({}), LensPromptCompilationError)
          assert.equal(Object.isFrozen(prompt), true)
          assert.deepEqual(prompt.ref, compiled.ref)
        } finally { await lens.close() }
        await assert.rejects(compileSupportPrompt(lens, 'Closed client'))`)
      assert.equal(receiver.requests[0].url.pathname, '/api/public/prompts/support%2Fanswer')
      assert.equal(receiver.requests[0].url.searchParams.get('label'), 'production')
    } finally { await receiver.close() }
  })

}
