# Static and dynamic tools

Keep essential tools static and retrieve the larger, less frequently used catalog dynamically.

## 1. Combine both sources

```ts
import { Agent } from '@anvia/core'

const agent = new Agent({
  id: 'support',
  model,
  tools: [
    createEscalationTool(scope),
    createHumanHelpTool(scope),
    supportIndex,
  ],
})
```

Static definitions appear on every model turn. Each `ToolIndex` contributes only the matches returned for the current search text.

## 2. Keep essential capabilities static

Static tools fit capabilities that are:

- required in most workflows
- the safe fallback when no specialist matches
- necessary for clarification or human escalation
- part of a small, stable agent contract

Dynamic tools fit a large long-tail catalog where only a few capabilities are relevant to one prompt.

## 3. Understand name precedence

If a static tool and an indexed tool have the same name, the static tool wins. Its definition is retained in the model request, and its concrete implementation is retained in agent lookup.

Tool names must be unique across separate indexes. The agent rejects construction when two indexes register the same name.

Use these checks as collision protection, not as a versioning mechanism. Keep names unique and test the assembled catalog.

## 4. Expect the set to change by turn

```text
Turn 1 user text: "Find invoice 123"
  static: escalate, human_help
  dynamic: get_invoice

Turn 2 tool result: "Invoice 123 is disputed"
  static: escalate, human_help
  dynamic: open_dispute, review_refund_policy
```

The runtime searches again with textual tool results. Static tools remain visible throughout.

## 5. Budget each index

Each index applies its own `topK`, so multiple indexes may contribute up to the sum of their limits. Static definitions are added on top of those results.

Keep the combined visible set focused. If a dynamic tool appears on nearly every turn, consider making it static. If a static tool is rarely relevant, evaluate moving it into an index.

Next, secure the [retrieval and execution boundary](/sdk/advanced/dynamic-tools/safety).
