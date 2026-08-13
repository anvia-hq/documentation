# Dynamic context

Dynamic context automatically retrieves relevant documents before every agent turn. It gives the model focused knowledge without placing the full corpus in every request.

## Explore dynamic context

| Page | Learn how to |
| --- | --- |
| [Add context](/sdk/advanced/dynamic-context/add-context) | Attach a prepared vector index to an agent. |
| [Formatting](/sdk/advanced/dynamic-context/formatting) | Turn search results into concise model-ready documents. |
| [Filters and permissions](/sdk/advanced/dynamic-context/filters) | Scope retrieval with trusted application state. |
| [Multiple indexes](/sdk/advanced/dynamic-context/multiple-indexes) | Combine independent knowledge sources without flooding the prompt. |

## How it works

```text
Current prompt → vector search → filter and rank → format documents → model turn
```

For each turn, Anvia searches every registered dynamic-context index with the current runtime prompt. Matching results are converted into documents and sent with that turn's model request.

Retrieval runs again after a tool call. A later turn can therefore receive different documents as the conversation and tool results change.

## Add automatic retrieval

```ts
import { Agent } from '@anvia/core'
import { vectorFilter } from '@anvia/core/vector-store'

const agent = new Agent({
  id: 'docs-support',
  model: model,
  instructions: 'Use retrieved documentation when it is relevant.',
  dynamicContexts: [{ index: docsIndex, topK: 5, threshold: 0.72, filter: vectorFilter.eq('published', true) }],
})
```

`docsIndex` must implement `VectorSearchIndex`. Prepare and populate the index outside the request path; see [Knowledges](/sdk/knowledges) for ingestion, embeddings, and vector stores.

## Choose the right source

| Requirement | Use |
| --- | --- |
| Small facts safe for every run | Static `context` option |
| Relevant documents selected every turn | `dynamicContexts` option |
| Optional, model-directed search | `index.asTool(...)` |
| Live or permissioned product data | A scoped tool |
| A large searchable tool catalog | `dynamicTools` option |

Dynamic context is read-only evidence. It should not replace service calls for current account state or actions that need validation, authorization, and audit.
