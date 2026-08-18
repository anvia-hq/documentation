# Get started

Install the adapter with Core:

```sh
pnpm add @anvia/core @anvia/gemini
```

Use an API key for the Gemini Developer API:

```ts
import { Agent } from '@anvia/core'
import { GeminiClient } from '@anvia/gemini'

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY!,
})

const agent = new Agent({
  id: 'assistant',
  model: gemini.completionModel({
      modelId: 'gemini-3.6-flash'
  }),
})

const result = await agent.generate({
    prompt: 'Summarize this document.'
})

if (result.status === 'completed') {
  console.log(result.output)
}
```

## Add embeddings

```ts
const documents = gemini.embeddingModel({
    modelId: 'gemini-embedding-001',
    taskType: 'RETRIEVAL_DOCUMENT',
    dimensions: 768
})

const vectors = await documents.embedTexts([
  'Anvia is a provider-neutral TypeScript runtime.',
])
```

Create a second model configured with `RETRIEVAL_QUERY` for queries while keeping model and dimensions aligned with indexed documents.

## Use Vertex AI

```ts
const vertex = new GeminiClient({
  vertexAi: {
    projectId: 'my-gcp-project',
    location: 'us-central1',
  },
})
```

Vertex mode and API-key mode are mutually exclusive. See [Vertex AI](/packages/gemini/vertex-ai).

## Before production

- Keep credentials server-side.
- Use explicit model IDs for each capability.
- Confirm model availability in the selected API or Vertex region.
- Test image, audio, tools, and schemas with the exact model.
- Reindex vectors when dimensions or task configuration changes.
- Treat malformed provider output as an error.
