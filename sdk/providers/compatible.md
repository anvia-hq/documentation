# OpenAI-compatible APIs

Use `@anvia/openai` when a provider or gateway exposes an OpenAI-compatible HTTP API. `OpenAIClient` handles the compatible wire format while agents and application services continue to use Anvia model contracts.

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.COMPATIBLE_API_KEY!,
  baseUrl: 'https://provider.example.com/v1',
})

export const model = client.completionModel({
    modelId: 'provider/model-name',
    api: "chat"
})
```

OpenAI-compatible does not mean OpenAI-equivalent. An endpoint may accept one Chat Completions request but differ in streaming chunks, tool calls, schemas, reasoning fields, usage, media, errors, or model discovery.

## The configuration boundary

A compatible deployment has five important choices:

- `baseUrl` selects the provider or gateway API root.
- `apiKey`, or a preconfigured `client`, supplies server-side authentication.
- `completionModel({ modelId, api })` selects the endpoint's exact model ID and the Chat or Responses adapter.
- `headers` supplies trusted gateway headers when required.

Provider-specific request fields belong in `providerOptions` at the narrow call site that needs them.

Select `api: 'chat'` for a Chat Completions-compatible endpoint. Select `api: 'responses'` only after proving that the endpoint implements the Responses API.

## Prove compatibility per workflow

Do not approve an endpoint because one text request succeeded. Test every product path against the exact endpoint, adapter, model ID, account, and parameters:

- non-streaming and streaming text
- tools, tool choice, and multi-turn tool replay
- schema-constrained output
- reasoning metadata
- image or document input
- embeddings and media routes
- usage reporting and failure mapping

The smallest useful integration is often completion-only. Add other model factories only after the endpoint documents and passes tests for those OpenAI-compatible routes.

## Continue the setup

1. [Configure the endpoint and credentials](/sdk/providers/compatible/setup).
2. [Choose Chat or Responses](/sdk/providers/compatible/adapters).
3. [Verify required capabilities](/sdk/providers/compatible/capabilities).
4. [Pin models and provider parameters](/sdk/providers/compatible/models-and-parameters).
5. Run the [compatibility test plan](/sdk/providers/compatible/testing).
6. Review the [production checklist](/sdk/providers/compatible/production).
