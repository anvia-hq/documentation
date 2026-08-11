# OpenAI

`@anvia/openai` turns OpenAI APIs into Anvia model contracts. Create the provider client once at the server boundary, choose the model capability the workflow needs, and pass that model into agents, completions, retrieval, or media pipelines.

```ts
import { OpenAIClient } from '@anvia/openai'

export const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})
```

## Choose a model

| Workflow | Factory | Continue with |
| --- | --- | --- |
| Agents, completions, tools, and structured output | `completionModel(...)` | [Completions](/sdk/providers/openai/completions) |
| Retrieval and semantic search | `embeddingModel(...)` | [Embeddings](/sdk/providers/openai/embeddings) |
| Image creation | `imageGenerationModel(...)` | [Media models](/sdk/providers/openai/media) |
| Text-to-speech | `audioGenerationModel(...)` | [Media models](/sdk/providers/openai/media) |
| Speech-to-text | `transcriptionModel(...)` | [Media models](/sdk/providers/openai/media) |
| Provider inventory | `listModels()` | [Model listing](/sdk/providers/openai/model-listing) |

OpenAI completion models use the Responses adapter by default when no custom `baseUrl` is configured. Choose the Chat adapter only when the target or workflow requires it; the differences are covered in [Responses and Chat](/sdk/providers/openai/responses-and-chat).

## What the provider owns

The package maps Anvia requests, content, tool calls, streams, usage, and media results to and from OpenAI. The application still owns instructions, tool permissions, memory, tenant routing, credential storage, fallback policy, retries, and observability.

Keep those boundaries visible in code. A provider model should be an injected dependency, not the place where product behavior or authorization decisions are hidden.

## Start here

1. [Install and configure the client](/sdk/providers/openai/setup).
2. [Create a completion model](/sdk/providers/openai/completions) for an agent or direct request.
3. Add only the additional capability models the workflow uses.
4. Review the [production checklist](/sdk/providers/openai/production) before shipping.

