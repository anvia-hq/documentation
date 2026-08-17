# OpenAI

`@anvia/openai` turns OpenAI APIs into Anvia model contracts. Create the provider client once at the server boundary, choose the model capability the workflow needs, and pass that model into agents, completions, retrieval, or media pipelines.

```ts
import { OpenAIClient } from '@anvia/openai'

export const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})
```

## Choose a model

Use `completionModel()` for agents, direct completions, tools, and structured output.

Use `embeddingModel()` for retrieval and semantic search.

Use `imageGenerationModel()`, `speechGenerationModel()`, and `transcriptionModel()` for their separate [media contracts](/sdk/providers/openai/media).

Use `listModels()` for administrative [model inventory](/sdk/providers/openai/model-listing).

OpenAI completion models require `api: 'responses' | 'chat'` on `completionModel({ modelId, api })`. `baseUrl` does not select the API; choose it explicitly for the target endpoint. The differences are covered in [Responses and Chat](/sdk/providers/openai/responses-and-chat).

## What the provider owns

The package maps Anvia requests, content, tool calls, streams, usage, and media results to and from OpenAI. The application still owns instructions, tool permissions, memory, tenant routing, credential storage, fallback policy, retries, and observability.

Keep those boundaries visible in code. A provider model should be an injected dependency, not the place where product behavior or authorization decisions are hidden.

## Start here

1. [Install and configure the client](/sdk/providers/openai/setup).
2. [Create a completion model](/sdk/providers/openai/completions) for an agent or direct request.
3. Compare [Responses and Chat](/sdk/providers/openai/responses-and-chat).
4. Add only the additional capability models the workflow uses.
5. Review the [production checklist](/sdk/providers/openai/production).
