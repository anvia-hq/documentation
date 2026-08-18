# Configuration

Configure `OpenAIClient` once, then create capability-specific model objects.

## Client options

| Option | Purpose |
| --- | --- |
| `apiKey` | Credential used when `client` is not supplied. |
| `baseUrl` | Replaces the OpenAI API base URL. |
| `headers` | Adds default SDK headers. |
| `client` | Reuses an initialized official OpenAI SDK client. |

```ts
const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
  headers: {
    'X-Application': 'support-api',
  },
})

const model = openai.completionModel({
  modelId: 'gpt-5.6-sol',
  api: 'responses',
})
```

When `client` is provided, its transport, retry, timeout, and connection settings remain owned by the official SDK instance.

## Completion request options

Use normal Anvia agent or direct-completion options for messages, tools, schemas, temperature, and token limits. Provider-only fields belong in `providerOptions`:

```ts
const response = await model.completion({
  chatHistory,
  documents: [],
  tools: [],
  providerOptions: {
    reasoning: { effort: 'high' },
  },
})
```

Only send fields supported by the selected OpenAI API and model. `providerOptions` is a pass-through, not cross-provider validation.

## Embedding options

```ts
const embeddings = openai.embeddingModel({
    modelId: 'text-embedding-3-small',
    dimensions: 768,
    user: 'tenant-safe-correlation-id',
    maxBatchSize: 128
})
```

`maxBatchSize` controls application batching, not provider concurrency. Keep it within endpoint limits. Do not put secrets or raw customer data into `user` merely for logging convenience.

## Media options

Image, speech, and transcription requests accept `providerOptions`. These objects are merged into the provider request, so provider fields can override adapter defaults. Use this intentionally and test the resulting media type and output shape.

## Runtime and production

The package is ESM, includes TypeScript declarations, should be installed with the matching `@anvia/core` release candidate, and uses the official `openai` SDK. Keep it in a trusted server runtime. If an edge runtime is required, validate the official SDK, upload APIs, binary handling, and streaming behavior in that exact environment.
