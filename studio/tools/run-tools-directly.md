# Run tools directly

The Studio runner invokes a selected tool without asking a model to choose it. Use it to check schema validation, handler behavior, dependency access, normalized results, and failure messages while developing an agent.

This is an integration probe, not a complete agent simulation.

## Run a tool

Start an agent that exposes at least one tool, then open `http://localhost:4021/ui/tools`:

1. Select the agent when the Studio process has more than one.
2. Select **Use** beside the tool.
3. Enter arguments in **Form** or **JSON** mode.
4. Review the tool name and origin one more time.
5. Select **Run**.

For a tool such as `get_ticket`, the input might be:

```json
{
  "id": "TICKET-1001"
}
```

Studio resolves the tool from the agent, parses and validates the input, calls the handler, validates a declared output schema, and normalizes the returned value for display.

## Read a successful run

The primary panel shows **Tool result**. String results that contain JSON are rendered as structured JSON when possible; other values retain their display form.

Expand **Raw run response** for the complete Studio envelope:

```json
{
  "agentId": "support-inspector",
  "toolName": "get_ticket",
  "status": "success",
  "result": "{\"id\":\"TICKET-1001\",\"status\":\"monitoring\"}",
  "durationMs": 4,
  "startedAt": "2026-08-11T08:00:00.000Z",
  "endedAt": "2026-08-11T08:00:00.004Z",
  "events": []
}
```

The exact `result` representation depends on the normalized tool output. The envelope also includes timestamps, elapsed time, and any nested stream events emitted through the tool call context.

## Understand validation and errors

Failures can occur at several boundaries:

| Boundary | Typical result |
| --- | --- |
| JSON editor | Malformed JSON is shown locally and the request is not sent. |
| Studio request | A missing agent/tool or non-JSON-compatible body is rejected by the HTTP route. |
| Input schema | Zod rejects invalid fields before the handler executes. |
| Handler | Thrown dependency, authorization, or application errors fail the run. |
| Output schema | A handler result that violates the declared output schema fails the run. |

For an execution failure, Studio shows **Tool error** and preserves a raw envelope with `status: "error"`, serialized error details, timing, and emitted events. A failed run returns an error response but remains visible in the runner so you can adjust the arguments or implementation.

## What direct invocation bypasses

Selecting **Run** calls the tool through `agent.callTool(...)`; it does not start an agent run. Therefore the direct runner does not exercise:

- model tool selection or argument generation;
- instructions, context retrieval, or multi-turn behavior;
- lifecycle callbacks, guardrails, and the Playground transcript lifecycle;
- the interactive approval flow;
- the model's recovery after a tool result or error.

The runner can invoke static, dynamic, and MCP-backed tools, but those calls are intentional manual executions. For a dynamic tool, the runner does not test whether semantic retrieval would select that definition for a prompt.

## Treat Run as a real operation

Direct does not mean dry-run. The handler can write to databases, call remote APIs, send messages, charge an account, or mutate an MCP server. Studio does not automatically mock dependencies or roll back side effects.

Use development credentials and test data. Keep authorization and tenancy checks inside the handler, and start with read-only tools when validating a new Studio setup.

::: warning Approval policies do not guard the direct runner
An **approval required** badge describes agent-run policy. The Tools runner executes the selected handler immediately and does not display Approve/Reject controls. Use the [Playground approval workflow](/studio/playground/approvals-and-questions) when you need to test authorization pauses.
:::

Continue to [Approval behavior](/studio/tools/approval-behavior) for the exact distinction.
