# Event types

Completion and agent streams share model-generation events, but agent events add runtime turns, tool execution, and final run state.

## Completion events

| Event | Contains |
| --- | --- |
| `text_delta` | Incremental visible text. |
| `reasoning_delta` | Provider reasoning content when available. |
| `tool_call_delta` | Provisional tool name or argument fragments. |
| `tool_call` | A completed model tool request. |
| `source` | A provider-reported source. |
| `provider_tool_call` | A tool executed by the provider. |
| `message_id` | The provider message identifier. |
| `final` | The normalized completion response. |
| `error` | A provider or stream failure with optional usage. |

Local tool calls in a direct completion stream are data only; they are not executed by the helper.

## Agent events

| Event | Contains |
| --- | --- |
| `turn_start` | Turn number, current prompt, and history. |
| `generation_start` | The provider-facing normalized request and model information. |
| `text_delta` | Incremental visible assistant text. |
| `reasoning_delta` | Provider reasoning content when available. |
| `tool_call_delta` | Provisional local tool-call data. |
| `tool_call` | A completed local tool request. |
| `tool_result` | Tool name, call IDs, arguments, and text result. |
| `source` | A provider-reported source. |
| `provider_tool_call` | A provider-executed tool record. |
| `agent_tool_event` | A nested event from an agent used as a tool. |
| `turn_end` | The completed provider response and optional first-delta timing. |
| `final` | Run ID, output, usage, messages, and optional trace or provider artifacts. |
| `error` | The failure and cumulative authoritative usage. |

## Choose what each surface receives

Internal operations tools may need full events. User-facing clients usually need only safe text, generic tool status, a final result, and a stable error message.
