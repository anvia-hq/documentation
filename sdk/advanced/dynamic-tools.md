# Dynamic tools

Dynamic tools let Anvia search a large tool catalog and send only the most relevant tool definitions to the model for each turn.

## Explore dynamic tools

| Page | Learn how to |
| --- | --- |
| [Tool sets](/sdk/advanced/dynamic-tools/tool-sets) | Group and execute concrete tool implementations. |
| [Tool index](/sdk/advanced/dynamic-tools/index) | Build a searchable catalog and attach it to an agent. |
| [Embedding text](/sdk/advanced/dynamic-tools/embedding-text) | Improve selection with accurate capability language. |
| [Static and dynamic](/sdk/advanced/dynamic-tools/static-and-dynamic) | Keep essential tools visible while retrieving the long tail. |
| [Safety](/sdk/advanced/dynamic-tools/safety) | Filter exposure and enforce authorization at execution. |
| [Checklist](/sdk/advanced/dynamic-tools/checklist) | Verify relevance, permissions, and catalog freshness. |

## Why retrieve tools

Static tools are included in every model turn. That is the right default for a small, stable set, but a large catalog increases prompt size and makes tool choice less focused.

Dynamic selection adds a retrieval step:

```text
Current prompt
    ↓
Search embedded tool definitions
    ↓
Apply metadata filter and threshold
    ↓
Send selected definitions to the model
    ↓
Execute the chosen tool from the backing ToolSet
```

The model sees only selected definitions. The application still owns every concrete tool implementation.

## Build a dynamic catalog

```ts
import { Agent } from '@anvia/core'
import { createToolIndex } from '@anvia/core/tool'
import { vectorFilter } from '@anvia/core/vector-store'

const toolIndex = await createToolIndex(
  embeddingModel,
  allSupportTools,
  {
    metadata(tool) {
      return {
        productArea: tool.name.startsWith('billing_')
          ? 'billing'
          : 'support',
      }
    },
  },
)

const agent = new Agent({
  id: 'billing-support',
  model: model,
  dynamicTools: [{ index: toolIndex, topK: 6, threshold: 0.72, filter: vectorFilter.eq('productArea', 'billing') }],
})
```

Anvia searches again before every turn. Tool results can change the current runtime prompt, so a later turn may receive a different set of definitions.

## Use it for scale, not authorization

Dynamic retrieval narrows the model-facing action surface. It does not prove that the user may execute a selected tool. Every handler must still validate input, enforce user and tenant permissions, protect side effects, and record sensitive actions.
