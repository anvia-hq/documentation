# Search tools

Expose an index as a tool when the model should decide whether retrieval is needed or refine its query across turns.

## Create the tool

```ts
const searchRunbooks = runbookIndex.asTool({
  name: 'search_runbooks',
  description: 'Search incident runbooks for operational guidance.',
  topK: 3,
  threshold: 0.72,
  filter: runbookFilter,
})
```

Every `VectorSearchIndex` supports `asTool(...)`. The tool accepts a query and returns scored search results to the model.

## Add it to an agent

```ts
const agent = new Agent({
  id: 'incident-assistant',
  model: model,
  instructions: 'Search runbooks before answering incident response questions.',
  maxTurns: 3,
  tools: [searchRunbooks],
})
```

The model can search, inspect the result, refine its query, and then produce a final answer. Keep the turn limit bounded.

## Search tool or automatic retrieval

| Use | Choose |
| --- | --- |
| Knowledge is relevant to most prompts. | [Automatic retrieval](/sdk/knowledges/automatic-retrieval) |
| Search is occasional or may require query refinement. | Search tool |
| Data is live, permissioned, or actionable. | An application [tool](/sdk/tools) |

Apply [metadata filters](/sdk/knowledges/metadata-filters) before exposing results. The model should never decide which tenant or visibility scope it may search.
