# Dynamic tools

The Dynamic Tools view inspects tool definitions stored in semantic indexes. These are the candidate capabilities Anvia can retrieve for a model turn when a large catalog should not be sent in full.

Open `http://localhost:4021/ui/knowledge/dynamic-tools`.

## Register a dynamic tool index

```ts
import { createToolIndex } from '@anvia/core/tool'

const toolIndex = await createToolIndex(embeddingModel, [
  getTicket,
  lookupCustomer,
  searchRunbooks,
])

const agent = new Agent({
  id: 'support-agent',
  model: model,
  dynamicTools: [{ index: toolIndex, topK: 2, threshold: 0.75 }],
})
```

At runtime, Anvia searches the tool index from the current prompt, applies the threshold and filter, and adds up to `topK` matching definitions to the model request. If the model selects one, Anvia resolves and executes the concrete tool from the index's backing tool set.

## Inspect the catalog

Select a dynamic tool source, then choose a tool. Studio presents:

- the tool name and description;
- a readable call signature;
- parameter names, types, required state, and descriptions;
- the agent, source ID, and item ID;
- expandable raw definition and index metadata.

The source list is paginated with **Load more**. As with dynamic context, browsing requires an index that exposes `inspect(...)`. A searchable index without that optional method still works during agent runs, but Studio cannot enumerate its definitions.

## Catalog presence is not runtime selection

Seeing `lookup_customer` here proves that its definition exists in the registered index. It does not prove that Anvia selected it for a particular prompt or that the model called it.

Use three Studio surfaces for three different questions:

| Question | Surface |
| --- | --- |
| Is the definition present and correctly described? | Dynamic Tools |
| Was the definition available to this generation? | [Retrieval evidence](/studio/knowledge/retrieval-evidence) |
| Did the model call it, and what happened? | [Trace inspector](/studio/traces/inspect-a-trace) |

The general [Tools view](/studio/tools) also brings static, dynamic, and MCP-backed definitions together and supports direct execution. Direct invocation bypasses semantic selection, so use it to test the handler—not retrieval quality.

## Improve weak selection

Dynamic selection depends heavily on definition quality. Prefer specific action-oriented names, concrete descriptions, and parameter descriptions that include the language users actually use. If an unrelated tool appears, review its embedding text and threshold. If the correct tool never appears, check its index record, registration filter, and `topK` before increasing the entire catalog sent to the model.

For index construction, custom vector stores, filters, and safety policy, continue to [SDK dynamic tools](/sdk/advanced/dynamic-tools).
