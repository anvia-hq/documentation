# `@anvia/core` API reference

Core exposes common authoring APIs from `@anvia/core` and larger contracts from capability-specific subpaths. Application code should not import `@anvia/core/internal/*`; those entry points exist for Anvia integration packages.

## Agents

Import from `@anvia/core` or `@anvia/core/agent`.

```ts
const agent = new Agent({
  id: 'support',
  model,
  name: 'Support agent',
  description: 'Answers account questions.',
  instructions: 'Use tools for account facts.',
  context: [staticDocument, contextIndex],
  tools: [lookupAccount, toolIndex],
  mcpServers: [mcpServer],
  skills,
  temperature: 0.2,
  maxTokens: 800,
  maxTurns: 5,
  toolChoice: 'auto',
  outputSchema,
  lifecycle,
  observability: { observers: { default: observer } },
  guardrails: policy,
  middlewares: [middleware],
  memory: { store: memoryStore },
})
```

Important methods:

```ts
agent.generate(options): Promise<AgentResult>
agent.stream(options): AgentStream<AgentStreamEvent>
agent.resume(pending, decision): Promise<AgentResult> | AgentStream
agent.asTool(options): Tool
```

Run options include `maxTurns`, `retries`, `abortSignal`, `lifecycle`, `guardrails`, `toolConcurrency`, `middlewares`, and `trace`.

`AgentResult` is a discriminated union:

```ts
type AgentResult =
  | {
      status: 'completed'
      runId: string
      output: string
      text: string
      usage: Usage
      messages: Message[]
      trace?: AgentTraceInfo
    }
  | {
      status: 'blocked'
      stage: 'input' | 'output'
      runId: string
      text: string
      usage: Usage
      messages: Message[]
    }
  | {
      status: 'approval_required'
      runId: string
      approval: AgentToolApprovalRequest
      usage: Usage
      messages: Message[]
    }
```

Pass `session: { sessionId, userId?, metadata? }` with a prompt to load and persist memory for that run. Use the configured store's `load({ scope })` and `clear({ scope })` methods for authorized inspection and deletion.

Use `createVectorContext({ store, model, topK, minScore?, filter?, format? })` to register prompt-time vector retrieval in an agent's `context` array.

## Direct completions

Import from `@anvia/core` or `@anvia/core/completion`.

```ts
const result = await generateCompletion({
    prompt: input,
    model,
    instructions,
    documents,
    tools,
    temperature,
    maxTokens,
    toolChoice,
    outputSchema,
    providerOptions,
    retries
})
```

Pass exactly one of `prompt` or `messages`. The result contains typed `output`, visible `text`, normalized assistant `content`, `usage`, and `rawResponse`.

```ts
const result = await generateCompletion({
    prompt: input,
    model,
    outputSchema: schema
})

console.log(result.output)
```

`generateCompletion` converts a Zod schema to provider JSON Schema, parses the returned JSON, and validates it locally.

```ts
for await (const event of streamCompletion({
    prompt: input,
    model
})) {
  if (event.type === 'text_delta') process.stdout.write(event.delta)
}
```

`CompletionModel`, `StreamingCompletionModel`, `CompletionRequest`, `CompletionResponse`, `CompletionStreamEvent`, capability types, message types, tool-call content, usage, and JSON value types are exported from the completion subpath.

Messages are strict JSON-safe structural objects. Core exports role/content types plus `parseMessage`, `parseMessages`, `messageSchema`, and `messagesSchema` for runtime validation.

## Tools

Import from `@anvia/core` or `@anvia/core/tool`.

```ts
const tool = createTool({
  name: 'lookup_order',
  description: 'Look up one authorized order.',
  inputSchema: z.object({ orderId: z.string() }),
  outputSchema: z.object({
    orderId: z.string(),
    status: z.string(),
  }),
  requiresApproval: ({ orderId }) => ({
    reason: `Review access to ${orderId}.`,
  }),
  async execute(input, context) {
    return orders.lookup(input.orderId, context)
  },
})
```

`inputSchema` always validates arguments before execution. `outputSchema` is optional; when present, it validates and types the handler result. `requiresApproval` accepts a boolean, `{ reason? }`, or a callback returning one of those values or `false`.

Create a semantic tool catalog with:

```ts
const index = await createToolIndex({
    model: embeddingModel,
    tools: tools,
    topK: 4,
    minScore: 0.72,
    filter,
    content,
    metadata,
    concurrency: 2
});
```

Pass the returned `ToolIndex` directly in `Agent.tools`. `embedTools(...)` returns embedded tool documents without constructing an index. `isToolIndex(...)` identifies the public catalog type.

`createMiddleware(...)` preserves middleware callbacks for completion requests, completion responses, tool input, and tool output. `createThinkTool(...)` creates a model-visible scratch tool.

## Tool approval

Generated runs pause with `status: 'approval_required'` before a guarded tool executes:

```ts
const pending = await agent.generate({
    prompt: input
})

if (pending.status === 'approval_required') {
  const result = await agent.resume(pending, {
    approved: reviewer.approved,
    reason: reviewer.reason,
  })
}
```

The exact pending object must return to the originating agent. Approval is orchestration; authorization still belongs in the tool handler.

## Guardrails and lifecycle

`@anvia/core/guardrails` exports `defineGuardrailPolicy`, `defineInputGuardrail`, `defineOutputGuardrail`, and built-in factories under `guardrails`.

Input and output guardrails can allow, block, or rewrite at their supported boundary. `GuardrailPolicyInput` can be configured on the agent and supplemented for one run.

An `AgentLifecycle` can implement:

```ts
const lifecycle = {
  onStart(event) {},
  onStepFinish(event) {},
  onToolStart(event) {},
  onToolFinish(event) {},
  onFinish(event) {},
  onError(event) {},
}
```

Lifecycle callbacks observe stable run boundaries. They are not an authorization substitute and do not replace `requiresApproval`.

## Memory

Import contracts from `@anvia/core/memory`.

```ts
interface MemoryStore {
  readonly inspector?: MemoryInspector
  readonly compaction?: MemoryCompactionCapability
  load(options: { scope: MemoryScope }): Promise<Message[]>
  append(options: MemoryAppendOptions): Promise<void>
  clear(options: { scope: MemoryScope }): Promise<void>
  recordError?(options: MemoryErrorOptions): Promise<void>
}
```

The subpath also exports memory options, scope types, inspector contracts, compaction contracts, `createSummaryMemoryCompactor`, `isMemoryCompactionMessage`, and compaction errors.

## Embeddings and vector stores

`@anvia/core/embeddings` exports:

```ts
const { embedding } = await embedText({ model, text })
const { embeddings } = await embedTexts({ model, texts })
const { embedding: sparseQuery } = await embedSparseQuery({ model: sparseModel, query })
const { embeddings: sparse } = await embedSparseTexts({ model: sparseModel, texts })
const { documents: denseDocuments } = await embedDocuments({
  model,
  documents,
  id,
  content,
  metadata,
})
const { documents: hybridDocuments } = await embedDocuments({
  models: { dense: model, sparse: sparseModel },
  documents,
  id,
  content,
  metadata,
})
```

It also exports dense, sparse, and hybrid model contracts plus distance helpers.

`@anvia/core/vector-store` exports `InMemoryVectorStore`, `VectorStore`, `HybridVectorStore`, retrieval/search/inspection types, `vectorFilter`, and `createVectorSearchTool`.

```ts
const store = InMemoryVectorStore.fromDocuments({ documents: embedded })
const results = await retrieveDocuments({
  store,
  model: embeddingModel,
  query,
  topK: 5,
  filter,
})
```

## Documents

`@anvia/core/documents` exports `chunkText`, `extractPdfText`, and their option/result types.

The application owns file discovery, storage reads, upload authorization, malware scanning, OCR, and source IDs.

## Structured extraction

Import from `@anvia/core/extractor`.

```ts
const result = await extract({
  model,
  text,
  outputSchema: schema,
  instructions: 'Extract stated facts only.',
  retries,
  temperature,
  maxTokens,
  providerOptions,
})

console.log(result.output)
```

The result includes schema-validated `output`, normalized `content`, cumulative `usage`, and `rawResponse`. Exhausted attempts throw `ExtractionError`.

## Pipelines

Import from `@anvia/core/pipeline`.

```ts
const pipeline = new Pipeline({
    id: 'ticket-triage',
    inputSchema: ticketSchema,
    name: 'Ticket triage',
    description: 'Classifies one support ticket.',
    metadata: { owner: 'support' },
})
    .step({
    id: "step-1",
    name: 'Normalize',
    run: ({ input: input }) => normalizeTicket(input)
})
    .parallel({
    id: "parallel-1",
    branches: { policy: policyPipeline, signals: signalPipeline }
})
    .step({
    id: "step-2",
    run: ({ input: input }) => mergeResults(input)
})
    .agent({
    id: "agent-1",
    agent: synthesizer,
    approval: "reject",
    request({ input: input }) {
        return { prompt: String(input) };
    }
});

```

`Pipeline` is immutable; each composition method returns a new typed pipeline. Public composition methods are `step`, `use`, `parallel`, `agent`, and `extract`.

```ts
await pipeline.run({
    input: input,
    observer
});
await pipeline.runBatch({
    inputs: inputs,
    concurrency: 4
});
const graph = pipeline.graph();

```

The subpath exports graph, stage metadata, observer, run-event, and batch option types.

## Media

Use the direct helpers from their capability subpaths:

```ts
const image = await generateImage({
    prompt: prompt,
    model: imageModel,
    width: 1024,
    height: 1024,
    providerOptions,
    retries
})
```

```ts
const speech = await generateSpeech({
    text: text,
    model: audioModel,
    voice: 'alloy',
    speed: 1,
    providerOptions,
    retries
})
```

```ts
const transcript = await transcribe({
    audio: {
        data: audioBytes,
        filename: 'recording.wav'
    },
    model: transcriptionModel,
    language: 'en',
    prompt,
    temperature: 0,
    providerOptions,
    retries
})
```

Model, request, response, result, and retry types are exported from `@anvia/core/image-generation`, `@anvia/core/speech-generation`, and `@anvia/core/transcription`.

## MCP and skills

`@anvia/core/mcp` exports `McpClient` and `McpClientGroup` plus transport, server, and tool types. Construct a client with a `stdio`, `streamableHttp`, or `custom` transport, call `connect()`, register the returned `McpServer` through `Agent.mcpServers`, and close the owning client at the application lifecycle boundary.

`@anvia/core/skills` exports `skill.local(...)`, `loadSkills(...)`, `SkillSet`, and validation types.

## Observability

`@anvia/core/observability` exports the observer contracts for runs, model generations, and tools, along with trace options and `AgentObserverDispatchError`. Observer implementations come from integrations such as `@anvia/lens`, `@anvia/langfuse`, and `@anvia/otel`.

Attach observers to the agent and supply request identity through the run's `trace` option:

```ts
const result = await agent.generate({
    prompt: input,
    trace: {
        name: 'support-reply',
        userId,
        sessionId,
        tags: ['support'],
        metadata: { channel: 'web' },
    }
})
```

## Evaluations

`@anvia/core/evals` exports `defineEvalSuite`, `defineMetric`, `runEvalSuite`, built-in metrics, judge helpers, reporters, result formatters, and evaluation case/run types.

Use the [production evaluations guide](/examples/production/evaluations) for suite construction and reporter lifecycle. Use the package source for an exhaustive symbol list tied to the installed version.
