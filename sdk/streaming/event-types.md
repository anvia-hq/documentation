# Event types

Completion and agent streams share provider-generation events. Agent streams add runtime turns, tool execution, guardrails, approvals, and final run state.

## Completion events

`text_delta` contains incremental visible text.

`reasoning_delta` contains provider reasoning content when available. It may include an ID, content type, or signature.

`tool_call_delta` contains provisional tool-call fields. Its argument mode is either `append` or `replace`.

`tool_call` contains a completed model tool request. A direct completion stream does not execute it.

`source` and `provider_tool_call` expose provider-reported source or provider-executed tool records.

`message_id` contains the provider message identifier.

`final` contains the normalized `CompletionResponse`.

`error` contains the provider or stream failure and may include authoritative usage.

## Agent lifecycle events

`turn_start` contains the turn number, current prompt, and prior history.

`generation_start` contains the normalized provider request and model information. It can include private prompts, documents, and tool definitions, so do not expose it publicly by default.

Provider-generation events such as `text_delta`, `reasoning_delta`, `tool_call_delta`, `tool_call`, `source`, and `provider_tool_call` include the agent turn number.

`turn_end` contains the completed provider response and optional time-to-first-delta measurement.

## Agent runtime events

`tool_result` contains the tool name, call identifiers, arguments, text result, and optional structured result.

`agent_tool_event` wraps a nested child event from an agent used as a tool.

`guardrail_decision` records a guardrail outcome and may identify its turn.

`approval_required` ends the current stream segment with the pending approval request. Resume it with `agent.resume(pendingEvent, decision)`.

`final` contains the completed run ID, output, cumulative usage, messages, and optional context usage, trace, guardrails, sources, or provider tool calls.

`error` contains the failure and cumulative authoritative usage. The agent stream then throws the same failure when consumption continues.

## Project events for each surface

Operator tooling may need detailed runtime events. A user-facing client usually needs visible text, generic tool status, approval UI when supported, a final result, and a stable error message.

Project events before sending them over HTTP. Raw prompts, reasoning, tool arguments, tool results, model requests, and error objects may contain credentials or private application data.

Next, send selected events over a [server transport](/sdk/streaming/server-transport).
