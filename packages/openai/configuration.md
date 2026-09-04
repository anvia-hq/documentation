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

Only send fields supported by the selected OpenAI API and model. `providerOptions` is a pass-through, not cross-provider validation, and its mapping differs by adapter:

- Responses (`api: 'responses'`) forwards `providerOptions.reasoning` to the request.
- Chat Completions (`api: 'chat'`) does not read `providerOptions.reasoning`. On that API, `reasoning_effort` is set exclusively from the request's `controls.reasoningEffort`.

## Typed reasoning controls

`completionModel()` accepts a `controls` override typed per model:

```ts
const model = openai.completionModel({
  modelId: 'gpt-5.6-sol',
  api: 'responses',
  controls: { reasoningEffort: 'xhigh' },
})
```

Effort choices are validated per model family through `OpenAIControlsFor`. The exported union `OPENAI_REASONING_EFFORTS` covers `none | minimal | low | medium | high | xhigh | max`. The `gpt-5.6` family allows `none | low | medium | high | xhigh | max` with `medium` as the default; other families expose narrower sets — for example `gpt-5.3` allows `low` to `xhigh`, the `-pro` variants restrict `gpt-5-pro` to `high`, and legacy `o`-series models allow `low | medium | high`. Omitting `controls` applies these model-specific defaults.

Requests override the model-level value. Every `generateCompletion` call and agent run accepts a `controls` object, and `controls.reasoningEffort` wins over both the factory controls and `providerOptions`:

```ts
const response = await model.completion({
  chatHistory,
  controls: { reasoningEffort: 'low' },
})
```

On the Responses API a request-level effort is merged into the outgoing `reasoning` object, overriding any `providerOptions.reasoning.effort`. On Chat Completions it is the only source for `reasoning_effort`.

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

Image, speech, and transcription requests accept `providerOptions`. These objects are spread into the provider request first, and the adapter then sets its normalized fields (`model`, `prompt`, and `size` for images), so normalized fields win over matching `providerOptions` keys. Use `providerOptions` for additional provider fields, and test the resulting media type and output shape.

## Runtime and production

The package is ESM, includes TypeScript declarations, should use a version compatible with its declared `@anvia/core` dependency range, and uses the official `openai` SDK. Keep it in a trusted server runtime. If an edge runtime is required, validate the official SDK, upload APIs, binary handling, and streaming behavior in that exact environment.
