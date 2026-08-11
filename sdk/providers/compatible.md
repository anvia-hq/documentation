# OpenAI-compatible APIs

Use `@anvia/openai` when a provider or gateway exposes an OpenAI-compatible HTTP API. Anvia keeps the rest of the application on its normal model contracts while `OpenAIClient` handles the compatible request and response shape.

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.COMPATIBLE_API_KEY,
  baseUrl: 'https://provider.example.com/v1',
  completionApi: 'chat',
})

export const model = client.completionModel('provider/model-name')
```

OpenAI-compatible does not mean OpenAI-equivalent. An endpoint may accept a Chat Completions request but differ in streaming chunks, tool calls, structured output, reasoning fields, usage, media, error responses, or model discovery.

## What to configure

| Decision | Put it in | Why it matters |
| --- | --- | --- |
| Endpoint URL | `baseUrl` | Selects the provider or gateway. |
| Credential | `apiKey` or a preconfigured `client` | Keeps authentication at the server boundary. |
| Completion surface | `completionApi` | Selects `"chat"` or `"responses"`. |
| Exact model | `completionModel(modelId)` | Model IDs belong to the target endpoint. |
| Extra headers | `headers` | Supports trusted gateway configuration. |
| Provider parameters | Completion request `params` | Keeps non-portable behavior explicit. |

When a custom `baseUrl` is present, `OpenAIClient` defaults to the Chat adapter. Select Responses explicitly only after verifying that the endpoint implements the Responses API.

## Compatibility is proved per workflow

Do not enable an endpoint because one text request succeeded. Prove every path the product will use against the exact endpoint, model ID, and adapter:

- non-streaming and streaming output;
- tools and tool choice;
- schema-constrained output;
- reasoning metadata;
- image or document input;
- embeddings or media factories;
- usage reporting and failure mapping.

The smallest useful integration is usually completion-only. Add other factories only after the endpoint documents and passes tests for their corresponding OpenAI API routes.

## Start here

1. [Configure the endpoint and credentials](/sdk/providers/compatible/setup).
2. [Choose Chat or Responses](/sdk/providers/compatible/adapters).
3. [Verify the capabilities the application requires](/sdk/providers/compatible/capabilities).
4. [Pin model IDs and provider parameters](/sdk/providers/compatible/models-and-parameters).
5. Run the [compatibility test plan](/sdk/providers/compatible/testing) before reviewing the [production checklist](/sdk/providers/compatible/production).

