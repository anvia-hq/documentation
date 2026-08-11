# Streaming

Streaming exposes model or agent progress before the complete response is available.

## Explore streaming

| Page | Learn how to |
| --- | --- |
| [Completion streams](/sdk/streaming/completion-streams) | Consume normalized events from one model call. |
| [Agent streams](/sdk/streaming/agent-streams) | Follow turns, tools, text, usage, and final output. |
| [Event types](/sdk/streaming/event-types) | Understand completion and agent event contracts. |
| [Server transport](/sdk/streaming/server-transport) | Return JSONL or SSE from an HTTP route safely. |
| [Errors and cancellation](/sdk/streaming/errors-and-cancellation) | Map failures and stop unnecessary work. |
| [Resumable streams](/sdk/streaming/resumable-streams) | Recover after navigation or connection loss. |

## Choose the stream level

| Stream | Use when |
| --- | --- |
| Completion stream | The application needs provider-neutral deltas from one direct model call. |
| Agent stream | The application needs the full runtime loop, including turns, tools, nested agents, usage, and a final result. |

Direct completion streams do not execute local tools. Agent streams expose the runtime while it executes them.

## Treat streams as workflow state

Text is only one part of an agent stream. Product surfaces should also decide what tool progress, final usage, cancellation, and errors mean. Keep raw reasoning, tool arguments, tool results, and provider metadata off user-facing transports unless explicitly reviewed.
