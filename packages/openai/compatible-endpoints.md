# Compatible endpoints

`OpenAIClient` can target services that implement an OpenAI-compatible API.

```ts
const provider = new OpenAIClient({
  apiKey: process.env.PROVIDER_API_KEY,
  baseUrl: 'https://provider.example.com/v1',
})

const model = provider.completionModel('provider/model-name')
```

Supplying `baseUrl` selects Chat Completions by default because compatibility endpoints commonly implement `/chat/completions`, not the full Responses API. Override this only when the service documents Responses compatibility:

```ts
const provider = new OpenAIClient({
  apiKey,
  baseUrl,
  completionApi: 'responses',
})
```

## Compatibility is capability-specific

An endpoint that supports Chat Completions may not implement:

- `/responses`;
- embeddings;
- image generation;
- speech or transcription;
- model listing;
- OpenAI’s exact streaming, tool-call, or structured-output fields.

Test each factory independently. Do not infer media support from a successful completion.

## Reasoning and tools

Some compatible Chat endpoints return reasoning in provider-specific fields while using ordinary OpenAI tool calls. The adapter retains recognized reasoning history so later tool-result turns can be accepted by providers that require it.

Provider rules still apply. For example, a provider may reject forced tool choice while a thinking mode is active. Put provider-only thinking controls in `additionalParams`, and let the model choose tools when the endpoint requires that behavior.

## Production checklist

- Pin the endpoint and model ID in deployment configuration.
- Test text, tools, structured output, streaming termination, usage, and cancellation separately.
- Treat unknown stream chunks and malformed tool arguments as failures.
- Confirm whether retries can repeat side effects around tool execution.
- Keep an allowlist of models even if `listModels()` returns a larger inventory.
- Capture the provider name and selected adapter (`openai` versus `openai-chat`) in telemetry.

For exact constructor and model signatures, see the [API reference](/packages/openai/api-reference).
