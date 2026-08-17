# Tool index

A `ToolIndex` joins semantic search policy with the concrete tools an agent can execute.

## 1. Create an in-memory index

```ts
import { Agent } from '@anvia/core';
import { createToolIndex } from '@anvia/core/tool';
import { vectorFilter } from '@anvia/core/vector-store';
const billingIndex = await createToolIndex({
    model: embeddingModel,
    tools: supportTools,
    topK: 5,
    minScore: 0.72,
    metadata: (_tool, definition) => ({
        productArea: definition.name.split('_')[0],
        risk: definition.name.includes('refund') ? 'high' : 'normal',
    }),
    filter: vectorFilter.eq('productArea', 'billing')
});
const agent = new Agent({
    id: 'billing-support',
    model,
    tools: [billingIndex],
});
```

`topK` is required and must be a positive safe integer. `minScore`, when supplied, must be finite. `filter` restricts matches using metadata produced while embedding.

## 2. Know what creation does

`createToolIndex()` performs these steps before it resolves:

1. Deduplicate tools by name, with the last occurrence winning.
2. Resolve each definition with an empty prompt.
3. Build searchable text and optional metadata.
4. Embed those records.
5. Store them in an `InMemoryVectorStore`.
6. Return a `ToolIndex` containing search methods, policy, and concrete tools.

Definition or embedding failures reject index creation. Build required catalogs during startup or worker initialization so failures occur before requests are accepted.

## 3. Search on every eligible turn

The agent calls `index.search()` with the current text, `topK`, `minScore`, and `filter`. It resolves each matching `toolName` against `index.tools`, then asks that tool for its current model-facing definition.

Search runs for user text and for textual tool results on later turns. It does not run when the current message yields no search text.

## 4. Use another vector store

`embedTools()` prepares portable embedded records without creating the in-memory index:

```ts
import { embedTools } from '@anvia/core/tool';
const { documents } = await embedTools({
    model: embeddingModel,
    tools: supportTools,
    metadata: (_tool, definition) => ({
        productArea: definition.name.split('_')[0],
    })
});
await externalStore.upsert({
    documents: documents
});
```

An external adapter supplied to an agent must implement the complete `ToolIndex` contract: `kind: 'tool-index'`, the concrete `tools`, `topK`, optional `minScore` and `filter`, plus `search()`. `inspect()` is optional.

Use `isToolIndex()` to check unknown adapter values, but treat that as a structural check rather than proof that search results and concrete tools agree.

## 5. Keep definitions synchronized

Rebuild or re-index when a tool name, description, parameters, embedding text, metadata, or implementation set changes. A stored match must name a tool present in the backing catalog; unmatched records are skipped at runtime.

Next, improve [embedding text](/sdk/advanced/dynamic-tools/embedding-text).
