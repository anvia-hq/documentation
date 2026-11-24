# How do I give an agent hundreds of tools?

Put the long tail of tools in a tool index so each model turn sees only the most relevant definitions. Keep a small set of essential tools static.

```ts
import { Agent } from '@anvia/core'
import { createToolIndex } from '@anvia/core/tool'

const supportIndex = await createToolIndex({
  model: embeddingModel,
  tools: allSupportTools,
  topK: 6,
  minScore: 0.72,
})

const agent = new Agent({
  id: 'support',
  model,
  tools: [supportIndex],
})
```

`embeddingModel`, `model`, and `allSupportTools` are application-owned: an embedding model and a completion model from your provider package, and the concrete tools you have already defined.

## How does selection work?

The first turn searches with the user's text; later turns search with the latest tool result. If nothing reaches `minScore`, the index adds no definitions for that turn. The `tool_selection` stream event reports which tools a turn offered and every match with its score, and Studio's retrieval log shows the same matches.

## What if the tools are generic but the content is specific?

Use `searchTool()` when one generic tool, such as `search_runbooks`, fronts many entries. It searches the entries themselves and returns their text, so a query about a deployment checklist finds the right runbook. Without an embedding model, it matches terms instead.

## Does selection authorize a tool?

No. Retrieval changes what the model sees. Every tool must still validate input, enforce user and tenant permissions, and require approval where needed.

See [Dynamic tools](/sdk/advanced/dynamic-tools), [domain search](/sdk/advanced/dynamic-tools/domain-search), [embedding text](/sdk/advanced/dynamic-tools/embedding-text), and [Tools and MCP](/features/tools-and-mcp).
