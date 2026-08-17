# Dynamic tools

Dynamic tools let an agent search a large tool catalog and expose only the most relevant definitions on each model turn.

```text
Current user text or latest tool result
  -> search one or more tool indexes
  -> apply each index's minScore and metadata filter
  -> combine matches with static tools
  -> send the visible definitions to the model
  -> execute a selected registered tool
```

The application still registers the concrete tool implementations. Retrieval changes what the model sees; it does not replace execution policy.

## 1. Build an index

```ts
import { Agent } from '@anvia/core';
import { createToolIndex } from '@anvia/core/tool';
import { vectorFilter } from '@anvia/core/vector-store';
const billingIndex = await createToolIndex({
    model: embeddingModel,
    tools: allSupportTools,
    topK: 6,
    minScore: 0.72,
    metadata: (tool) => ({
        productArea: tool.name.startsWith('billing_')
            ? 'billing'
            : 'support',
    }),
    filter: vectorFilter.eq('productArea', 'billing')
});
const agent = new Agent({
    id: 'billing-support',
    model,
    tools: [billingIndex],
});
```

`createToolIndex()` embeds the searchable definitions, builds an in-memory vector index, and retains the matching concrete tools. Pass the returned index directly in `Agent.tools`.

## 2. Understand turn-by-turn selection

The first model turn searches with the current user's text. After a tool call, the next turn searches with the latest textual tool result. That lets the available capabilities follow the task as it develops.

If the search text is empty or no result reaches the minScore, the index contributes no definitions for that turn.

## 3. Use dynamic tools for a long tail

Keep a small set of essential actions static. Use an index when a catalog is large enough that sending every definition would add noise or unnecessary prompt size.

Dynamic selection is not authorization. Every tool must still validate input, enforce tenant and user permissions, protect side effects, and request approval when required.

## 4. Continue through the section

- [Build the tool catalog](/sdk/advanced/dynamic-tools/tool-sets)
- [Create and attach an index](/sdk/advanced/dynamic-tools/index)
- [Improve embedding text](/sdk/advanced/dynamic-tools/embedding-text)
- [Combine static and dynamic tools](/sdk/advanced/dynamic-tools/static-and-dynamic)
- [Secure retrieval and execution](/sdk/advanced/dynamic-tools/safety)
- [Review the checklist](/sdk/advanced/dynamic-tools/checklist)
