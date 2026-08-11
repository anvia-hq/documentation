# Hook points

Choose the narrowest lifecycle point that has the information and control your policy needs.

## Run hooks

| Hook | Runs when | Typical use |
| --- | --- | --- |
| `onRunStart` | The prompt run begins. | Validate limits or environment policy. |
| `onRunEnd` | The run completes successfully. | Record a final audit annotation. |
| `onRunError` | The run fails. | Correlate or classify the failure. |

Run hooks can continue or cancel the run.

## Turn and completion hooks

| Hook | Runs when | Typical use |
| --- | --- | --- |
| `onTurnStart` | An agent turn begins. | Track turn-level policy or state. |
| `onTurnEnd` | An agent turn finishes. | Record turn completion. |
| `onCompletionCall` | A model call is about to run. | Observe model-call intent or enforce a limit. |
| `onCompletionResponse` | A model call returns. | Inspect normalized completion behavior. |
| `onCompletionError` | A model call fails. | Record provider-call failure context. |

A tool-using run can contain several turns and completion calls. Run-level callbacks happen once; turn and completion callbacks may happen repeatedly.

## Tool hooks

| Hook | Runs when | Typical use |
| --- | --- | --- |
| `onToolCall` | The model has selected a tool. | Run, skip, cancel, or request approval. |
| `onToolResult` | A tool returns successfully. | Inspect the result or cancel future work. |
| `onToolError` | Tool execution fails. | Record or classify the failure. |

`onToolCall` has the broadest control surface because it runs before the selected tool executes.

## Control by phase

| Control | Run, turn, completion, and result hooks | `onToolCall` |
| --- | --- | --- |
| Continue | Yes | Yes, with `tool.run()` or no return value |
| Cancel the run | Yes, with `run.cancel(reason)` | Yes, with `tool.cancel(reason)` |
| Skip one tool | No | Yes, with `tool.skip(reason)` |
| Request approval | No | Yes, with `tool.requestApproval(...)` |

Returning nothing means continue. Return a control action only when the hook changes what the runtime should do.

## Follow the runtime boundary

Use observers for passive telemetry that should never affect execution. Use middleware when request, response, input, or output data needs transformation. Hooks should remain reserved for lifecycle observation that belongs with a run decision.
