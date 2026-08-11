# Session traces and logs

Traces explain the structure and data flow of a run. Session logs explain the runtime sequence around it. Use both when one view alone does not show why a local run behaved as it did.

## Open all traces for a session

There are two direct paths into the session trace view:

1. Open **Sessions** and select the tracing action beside a session.
2. Open a trace detail and select its **Session** ID.

Studio loads up to 50 traces for that session, orders them from earliest to latest, and shows them in one expandable timeline. The first trace is selected initially. Choose another `agent.run` node to inspect a later prompt without leaving the session.

This grouping is useful for multi-turn debugging. For example, an incorrect follow-up can come from the current model call, a tool result in the previous run, or conversation memory carried across both.

## Read session logs

The Playground shows **Session logs** beside the active conversation on wider screens. Start a session or reopen one to load its log history. New entries are appended while a run streams, and the panel follows the newest entry until you scroll away from the bottom.

Each row contains:

- timestamp and severity;
- a readable message;
- a `category/event` identifier;
- compact metadata such as run ID, turn, tool name, duration, byte counts, or usage.

Common entries include:

| Event | What it confirms |
| --- | --- |
| `session/session.created` | Studio created the session. |
| `api/run.received` | The runtime accepted a run request. |
| `run/run.started` | Agent execution began. |
| `memory/memory.loaded` | Stored conversation state was loaded. |
| `prompt/prompt.prepared` | A turn's prompt and history were prepared. |
| `tool/tool.called` | A tool call was emitted. |
| `tool/tool.completed` | That tool returned a result. |
| `model/model.turn.completed` | A model turn completed with optional usage. |
| `run/run.completed` | The run reached a successful final event. |
| `run/run.failed` | The run ended with an error. |
| `run/run.cancelled` | The Playground stream was stopped before a terminal event. |

Approval, question, and child-agent activity also produces dedicated entries when those capabilities are used.

## Correlate a failure

Use this sequence when debugging:

1. Find `run.failed` in the session log and note its timestamp and duration.
2. Find the failed response at the same point in the Playground transcript, then open its trace.
3. If needed, open the session trace view to compare the runs around it.
4. Expand the last turn and select the error observation.
5. Compare its **Input**, **Error**, and **Metadata**.

The log tells you when the run failed and which lifecycle events happened first. The trace shows the model or tool payload that caused the failure.

## Understand cancellation

Selecting **Stop generating** closes the active Playground stream. Studio preserves the partial transcript as a cancelled run, cancels pending approvals or questions, and appends `run.cancelled` with elapsed duration.

A cancelled streamed run might not have a completed trace because the local trace observer saves a trace when the agent run reaches success or error. Use the cancelled transcript and session log as the authoritative record of the stopped work.

## Keep history across restarts

The default in-memory store loses sessions, traces, and logs when Studio exits. Configure the SQLite store as shown in [Sessions](/studio/sessions) when you need to restart the agent and revisit the same local evidence.

Persistent Studio data is still development data. For retained application telemetry, broader filtering, collaborative investigation, and production monitoring, send observability data to [Lens](/lens/) instead.

For the detail-pane workflow, read [Inspect a trace](/studio/traces/inspect-a-trace).
