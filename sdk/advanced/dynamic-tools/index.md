# Tool index

A dynamic tool index connects semantic search results to the concrete tools Anvia can execute.

## Create an in-memory index

```ts
import { createToolIndex } from '@anvia/core/tool'

const toolIndex = await createToolIndex(
  embeddingModel,
  allSupportTools,
  {
    metadata(tool) {
      return {
        productArea: tool.name.startsWith('billing_')
          ? 'billing'
          : 'support',
        risk: tool.name.includes('refund')
          ? 'high'
          : 'normal',
      }
    },
  },
)
```

`createToolIndex(...)` resolves every tool definition, embeds its searchable text, builds an in-memory vector index, and retains the concrete tools in a backing `ToolSet`.

Tool-definition or embedding failures reject the call. Build required catalogs before accepting agent requests.

## Attach search policy

```ts
import { vectorFilter } from '@anvia/core/vector-store'

const agent = new AgentBuilder('billing-support', model)
  .dynamicTools(toolIndex, {
    topK: 6,
    threshold: 0.72,
    filter: vectorFilter.eq('productArea', 'billing'),
  })
  .build()
```

| Option | Purpose |
| --- | --- |
| `topK` | Maximum matching definitions added for one turn. |
| `threshold` | Rejects weak semantic matches. |
| `filter` | Restricts eligible tools by trusted metadata. |

## What happens each turn

1. Anvia derives search text from the current runtime prompt.
2. The index returns relevant tool documents.
3. Threshold and metadata filtering narrow the results.
4. Matching definitions are added to the model request.
5. If the model selects one, Anvia resolves it from `toolIndex.toolSet` and executes it.

Search repeats on later turns. A result from one tool can make another tool relevant to the next model call.

## Use your own vector store

`embedTools(...)` returns embedded tool documents when the catalog should live in another vector database:

```ts
import { embedTools } from '@anvia/core/tool'

const documents = await embedTools(
  embeddingModel,
  supportToolSet,
  {
    metadata: (_tool, definition) => ({
      productArea: definition.name.split('_')[0],
    }),
  },
)

await vectorStore.upsertDocuments(documents)
```

A custom `DynamicToolIndex` must expose both the search contract and the backing `toolSet`. Use `isDynamicToolIndex(...)` when validating an unknown adapter value.

## Keep the catalog current

Rebuild or re-index when a tool name, description, parameters, metadata, or implementation set changes. A stale vector record may retrieve a definition that no longer matches the executable tool contract.
