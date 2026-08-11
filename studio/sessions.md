# Sessions

Sessions keep related Playground runs together. Reopen one to restore its conversation, recorded run steps, traces, and runtime logs while you iterate on an agent.

## What a session contains

A Studio session belongs to one registered agent and records:

- its generated ID, title, and optional metadata;
- the messages used as conversation memory;
- a transcript for each run, including reasoning, tool calls, approvals, and questions;
- run status such as `running`, `success`, `error`, or `cancelled`;
- session logs and links to associated traces.

The **Sessions** table shows the title and ID, agent, message count, and last update. Sessions with the most recent activity appear first.

## Create and continue a session

You normally create sessions from the [Playground](/studio/playground). When you send the first prompt without an active session, Studio creates one and uses the beginning of that prompt as its title.

To continue earlier work:

1. Open **Sessions**.
2. Select the session you want to inspect.
3. Studio returns to the Playground and restores its transcript.
4. Send another prompt to continue with the stored conversation.

Studio also loads that session's trace summaries and logs. Opening or deleting another session is disabled while a Playground run is active, which prevents the active stream from being attached to the wrong conversation.

## Choose how long sessions live

Studio uses an in-memory store by default. It is ideal for disposable experiments, but all sessions, traces, and logs disappear when the Studio process stops.

Use the SQLite store when you want development history to survive a restart:

```ts
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { createSqliteSessionStore, Studio } from '@anvia/studio'
import { supportAgent } from './support-agent'

const databasePath = '.anvia-studio/studio.sqlite'
mkdirSync(dirname(databasePath), { recursive: true })

const store = createSqliteSessionStore({ path: databasePath })

new Studio([supportAgent], {
  stores: {
    sessions: store,
    traces: store,
    pipelineLogs: store,
    pipelineRuns: store,
  },
}).start({
  hostname: '127.0.0.1',
  port: 4021,
})
```

The SQLite adapter implements all four Studio store interfaces, so one local database can preserve sessions, traces, pipeline logs, and pipeline run history together.

## Stop a run without losing the session

Use **Stop generating** in the Playground to cancel an active streamed run. Studio closes the stream and records:

- the partial transcript produced before cancellation;
- a `cancelled` status for that run;
- cancellation of any pending approval or question;
- a `run.cancelled` log with the elapsed duration.

The session itself remains available. You can review the partial work and send another prompt afterward.

Stopping and deleting are separate actions:

| Action | Result |
| --- | --- |
| Stop an active run | Keeps the session and records the run as cancelled. |
| Delete a session | Removes the session, its messages, run transcripts, logs, and local traces. |

## Delete a session

Select the trash action beside a session and confirm the dialog. Deletion cannot be undone. With SQLite, it also removes that session's stored messages, runs, logs, and traces from the local database.

Delete sessions when they no longer help your development loop. Do not use deletion as a way to stop an active run; stop the run first.

Next, learn how to browse [Traces](/studio/traces) or inspect [session traces and logs](/studio/traces/session-traces-and-logs).
