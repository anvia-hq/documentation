# Event types

Completion and agent streams share provider-generation events. Agent streams add runtime turns, tool execution, guardrails, approvals, and final run state.

## Completion events

`text_delta` contains incremental visible text.

`reasoning_delta` contains provider reasoning content when available. It may include an ID, content type, or signature.

`tool_call_delta` contains provisional tool-call fields. Its argument mode is either `append` or `replace`.

`tool_call` contains a completed model tool request. A direct completion stream does not execute it.

`source` and `provider_tool_call` expose provider-reported source or provider-executed tool records.

`message_id` contains the provider message identifier.

`final` contains the completed `CompletionResult`, the same value `generateCompletion()` resolves with.

`error` contains the provider or stream failure and cumulative usage, empty when no provider attempt reported usage.

## Agent lifecycle events

`turn_start` contains the turn number, current prompt, and prior history.

`generation_start` contains the normalized provider request and model information. It can include private prompts, documents, and tool definitions, so do not expose it publicly by default.

Provider-generation events such as `text_delta`, `reasoning_delta`, `tool_call_delta`, `tool_call`, `source`, and `provider_tool_call` include the agent turn number.

`turn_end` contains the completed provider response, optional time-to-first-delta measurement, and optional `contextBreakdown`, the scaled split of the turn's input tokens by segment. The terminal `response` outcome carries the same split as `contextBreakdown` on the outcome, and `@anvia/client` forwards it on `message_end`, `turn_end`, and `run_end` frames. See [Context](/sdk/agents/context).

## Agent runtime events

`tool_selection` reports the tools a turn offered and what the agent's tool indexes returned to select them:
`{ type: 'tool_selection', turn, tools: string[], matches: { toolName, index, score }[] }`. `tools` lists every
offered tool in prompt order; `matches` lists only indexed selections, with the index's position in the agent's
tool list and its score. The event appears only when the turn's text hit an index, so it answers “why wasn't my
tool offered”. Replayed durable turns carry no matches because they do not search again, and a lexical or
semantic index that returns nothing emits no event. If you switch exhaustively on agent event types, add this
variant, and use `toolMatches` on the generation-start observer args for the same data outside the stream.

`tool_result` contains the tool name, call identifiers, arguments, text result, and optional structured result.

`agent_tool_event` wraps a nested child event from an agent used as a tool.

`guardrail_decision` records a guardrail outcome and may identify its turn.

`interaction_response` records an accepted approval or question response in the resumed phase.

`memory_compaction` reports automatic transcript compaction with message counts, token counts,
attempts, and summarizer usage.

`steering_applied` identifies the turn that accepted a previously queued steering receipt.

`response`, `interaction`, or `blocked` is the terminal outcome. A response includes `output`; an
interaction includes the request and JSON-safe continuation required to start a linked phase; a
blocked outcome includes guardrail stage, reason, and optional safe message.

`error` contains the failure and cumulative authoritative usage. The iterator then completes normally; the same failure rejects the `stream.result` and `stream.text` promises.

## Project events for each surface

Operator tooling may need detailed runtime events. A user-facing client usually needs visible text, generic tool status, approval UI when supported, a final result, and a stable error message.

Project events before sending them over HTTP. Raw prompts, reasoning, tool arguments, tool results, model requests, and error objects may contain credentials or private application data.

Next, send selected events over a [server transport](/sdk/streaming/server-transport).
