# Inspect schemas

Studio turns each tool's input JSON Schema into an argument editor. This lets you understand the model-facing contract and prepare a valid test call without reconstructing the payload by hand.

Select an agent in **Tools**, then select **Use** beside a tool. The runner shows its description, origin, approval badge, number of top-level fields, and expandable **Parameter schema**.

## From Zod to the Studio form

`createTool(...)` converts the Zod `input` schema into the JSON Schema returned by the tool definition:

```ts
const issueRefund = createTool({
  name: 'issue_refund',
  description: 'Issue a customer refund.',
  input: z.object({
    orderId: z.string().describe('The order ID to refund.'),
    amount: z.number().positive().describe('Refund amount in USD.'),
    reason: z.string().describe('Reason recorded with the refund.'),
    notifyCustomer: z.boolean().default(true),
  }),
  output: z.object({
    refundId: z.string(),
    status: z.literal('issued'),
  }),
  execute: issueRefundHandler,
})
```

Studio uses the input definition to render controls for:

| Schema shape | Editor behavior |
| --- | --- |
| String | Text field, with a default value shown as a placeholder when available. |
| Number or integer | Numeric text field that preserves incomplete drafts while you type. |
| Boolean | Checkbox. |
| Enum | Select menu. |
| Object | Nested fields. |
| Array | Add/remove controls for items when the item schema is known. |
| Unknown or custom shape | JSON value editor. |

Required fields receive a **required** badge. Schema titles become field labels, and `.describe(...)` text appears below the field. These descriptions are worth writing carefully because the same contract helps both the model and the person testing it.

## Switch between Form and JSON

Use **Form** for supported object schemas and **JSON** when you need to paste a complete payload or exercise a shape that the generated controls cannot express conveniently. Both modes edit the same JSON argument value.

The raw editor catches malformed JSON before a request is sent. Form controls improve input quality, but they are not the validation boundary. The tool's Zod input schema parses the arguments again when the handler is called.

For example, Studio may accept `-3` as syntactically valid JSON for `amount`, while `z.number().positive()` rejects it before `execute(...)` runs.

## Input and output are different contracts

Studio's **Parameter schema** is the tool definition's input schema—the payload the model or direct runner sends to the tool. The current Tools registry does not publish a separate output schema.

An output schema still matters:

```ts
output: z.object({
  refundId: z.string(),
  status: z.literal('issued'),
})
```

`createTool(...)` validates the handler result against this schema during execution. If the result is invalid, the run fails and Studio shows the serialized error. If it is valid, Studio displays the actual normalized value under **Tool result**.

This gives you two complementary checks:

- inspect the input schema before execution;
- inspect the actual validated output after execution.

It does not mean Studio can show an output contract in advance. Keep the output schema in source control and document meaningful result shapes in the SDK-facing tool documentation.

## Read the raw schema

Expand **Parameter schema** when generated controls hide an important constraint such as nested required fields, enum values, or an array item definition. The JSON block is the exact parameter object returned by the tool definition and is the best view for debugging unexpected form behavior.

After preparing a payload, continue to [Run tools directly](/studio/tools/run-tools-directly). For contract design, see [Define a tool](/sdk/tools/define) and [Validation and execution](/sdk/tools/validation-and-execution).
