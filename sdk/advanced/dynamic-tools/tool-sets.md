# Tool catalog

A dynamic catalog starts as an array of normal Anvia tools. The index keeps those concrete implementations so a retrieved definition can be executed later.

## 1. Build normal tools

```ts
import { Agent } from '@anvia/core';
import { createToolIndex } from '@anvia/core/tool';
const supportTools = [
    createSearchOrdersTool(scope),
    createGetInvoiceTool(scope),
    createRequestRefundTool(scope),
];
const supportIndex = await createToolIndex({
    model: embeddingModel,
    tools: supportTools,
    topK: 4,
    minScore: 0.7
});
```

There is no separate public `ToolSet` to construct. A `ToolIndex` exposes a read-only `tools` array as its execution backing catalog.

## 2. Keep names unique

Tool names are the link between search results, model-facing definitions, and implementations.

`createToolIndex()` deduplicates repeated names before embedding; the last tool with a name wins. Prefer rejecting duplicates in your own catalog builder so an accidental replacement cannot pass unnoticed.

An agent also rejects a name registered by more than one tool index. A static tool may share a name with an indexed tool, but the static tool wins both model exposure and execution lookup.

## 3. Understand registration and exposure

```ts
const agent = new Agent({
  id: 'support',
  model,
  tools: [alwaysEscalate, supportIndex],
})
```

The agent registers every concrete tool from the index, but sends only retrieved definitions to the model. `agent.tools` therefore represents executable registration, not the definitions visible on a particular turn.

The constructor snapshots the index's tool list, search policy, and filter. Mutating the original array or index options later does not reconfigure that agent.

## 4. Use direct calls carefully

```ts
const result = await agent.callTool(
  'get_invoice',
  JSON.stringify({ invoiceId: 'inv_123' }),
)
```

`agent.callTool()` can call a registered indexed tool without retrieval. It parses input and validates configured output, but it is a low-level direct call: it does not run an agent turn's approval, lifecycle, middleware, or observer flow.

Use direct calls in focused tests or behind an application policy boundary. Use `agent.generate()` or `agent.stream()` when the normal agent runtime must enforce run controls.

## 5. Scope concrete tools correctly

If handlers close over a user, tenant, transaction, or idempotency key, build the tools at that trusted scope. Do not place request-scoped implementations in a mutable global catalog.

Next, create the [tool index](/sdk/advanced/dynamic-tools/index).
