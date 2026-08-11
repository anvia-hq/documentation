# Traces

Studio traces show how a local agent run moved through model generations and tool calls. Use them to answer a focused development question: what did this agent do during this run, and where did the result or failure come from?

## Open the trace browser

Run an agent from the Playground, then open **Traces**. Studio lists the latest traces with:

| Column | Meaning |
| --- | --- |
| Trace | The trace ID recorded for the run. |
| Session | The Studio session that owns the run. |
| Agent | The registered agent associated with the trace. |
| Status | Whether the run succeeded, failed, or is still reported as running by the store. |
| Started | When the run began. |
| Duration | Total elapsed time for the run. |
| First delta | Time until the first recorded streamed model delta, when available. |
| Events | Number of recorded observations. |

Select a row to open its detail view. Studio loads up to 50 recent traces in the browser and can retrieve a selected trace directly when it is not in that initial set.

## What Studio records

Studio adds a local trace observer to registered agents when tracing storage is enabled. A session-associated run can then record three observation kinds:

- **Generation** — a model request and response for a turn, with provider, model, timing, and usage metadata when available.
- **Tool** — tool arguments, result or error, duration, call IDs, and tool metadata.
- **Agent** — nested agent activity produced through an agent tool, including its generations and child tool calls.

At trace level, Studio records the run input, final output or error, total usage, start and end time, duration, metadata, and observation count.

Tracing follows the actual agent observer lifecycle. A provider can omit some timing or usage fields, so the interface shows those metrics only when the run supplied them.

## Read a trace in context

The trace detail view groups work into an expandable timeline:

```text
agent.run
└─ turn.1
   ├─ model.turn.1
   └─ tool.lookup_order
      └─ nested agent observations, when present
```

Select the agent, a turn, or an individual observation to change the detail pane. The pane shows the selected item's status, timing, usage, input, output, error, and metadata.

See [Inspect a trace](/studio/traces/inspect-a-trace) for a field-by-field workflow.

## Follow a whole session

One session can contain several traces as you continue the conversation. Select the session ID in a trace detail, or use the tracing action in **Sessions**, to load that session's traces together in chronological order.

This makes it easier to compare an early prompt with later follow-ups without losing the conversation boundary. See [Session traces and logs](/studio/traces/session-traces-and-logs).

## Local development scope

The default trace store is in memory and is cleared when Studio restarts. A configured SQLite store preserves traces for later local inspection.

Studio tracing is a developer console, not an operational telemetry backend. Use it to inspect the agents running in the current Studio process. Use [Lens](/lens/) or another observability integration for durable production history, cross-environment search, release analysis, and team workflows.
