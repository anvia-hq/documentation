# Static and dynamic tools

Keep essential tools static and retrieve the larger, less frequently used catalog dynamically.

## Combine both sources

```ts
const agent = new Agent({
  id: 'support',
  model: model,
  dynamicTools: [{ index: toolIndex, topK: 5, threshold: 0.7, filter: allowedToolFilter }],
  tools: [createEscalationTool(scope), createHumanHelpTool(scope)],
})
```

Static definitions appear in every model turn. Dynamic definitions are selected from the current prompt for each turn.

## Choose which tools stay static

Static tools are a good fit when they are:

- required in many workflows
- the safe fallback when no specialized tool matches
- necessary for human escalation or clarification
- part of a small stable agent contract

Dynamic tools are a good fit for a large long-tail catalog where only a few capabilities are relevant to any one prompt.

## Understand name precedence

If a retrieved dynamic tool has the same name as a static tool, Anvia keeps the static definition and skips the duplicate dynamic definition.

Treat that behavior as collision protection, not a versioning strategy. Keep tool names unique and make any intentional override visible in tests and catalog review.

## Selection changes by turn

```text
Turn 1: "Find invoice 123"        → get_invoice
Tool result: invoice is disputed
Turn 2: updated runtime prompt    → open_dispute, review_refund_policy
```

Anvia searches dynamic tools again before the second model call. Static escalation and help tools remain available throughout.

## Keep the visible set focused

The total model-facing tool set is the static definitions plus up to `topK` dynamic results. Keep both limits small enough that the model can distinguish their responsibilities.

If a tool is almost always retrieved, consider making it static. If a static tool is rarely relevant, move it into the dynamic catalog and evaluate the change.
