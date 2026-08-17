# Search tools

A search tool lets the model decide when to query a vector store. Use it when retrieval is optional, when the first query may need refinement, or when an agent has several specialized knowledge sources.

## Create the tool

```ts
import { createVectorSearchTool, vectorFilter } from '@anvia/core/vector-store'

const runbookFilter = vectorFilter.and(
  vectorFilter.eq('tenantId', request.auth.tenantId),
  vectorFilter.eq('published', true),
)

const searchRunbooks = createVectorSearchTool({
  name: 'search_runbooks',
  description: 'Search approved incident runbooks for operational guidance.',
  store: runbookStore,
  model: embeddingModel,
  topK: 3,
  minScore: 0.72,
  filter: runbookFilter,
})
```

The generated tool accepts `query` and an optional positive `topK`. A call-time `topK` overrides the configured default; the configured minimum score and filter still apply.

## Add it to an agent

```ts
const agent = new Agent({
  id: 'incident-assistant',
  model,
  instructions: 'Search runbooks before giving incident-response guidance.',
  maxTurns: 3,
  tools: [searchRunbooks],
})

const result = await agent.generate({
  prompt: 'The API error rate increased after deployment. What should I check?',
})
```

Use [automatic retrieval](/sdk/knowledges/automatic-retrieval) when the same store is relevant to most prompts and the first turn should already contain supporting documents. Use a regular application [tool](/sdk/tools) for live records, authorization checks, and actions.

Construct metadata filters from authenticated application state. The model may choose the semantic query and result count, but it must not choose tenant, workspace, visibility, or access scope.
