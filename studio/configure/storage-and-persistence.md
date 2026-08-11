# Storage and persistence

Studio stores the state created by its development console: sessions, local traces, pipeline logs, and pipeline run history. Choose in-memory storage for disposable work or SQLite when you need that evidence after a restart.

## Default in-memory storage

No storage configuration is required:

```ts
import { Studio } from '@anvia/studio'
import { supportAgent } from './support-agent'

new Studio([supportAgent]).start()
```

Studio creates one in-memory store that implements all four storage capabilities. It creates no database file, and its contents disappear when the process exits.

This default is useful for quick experiments. It is a poor fit when restarting Studio is part of your comparison workflow, because the previous sessions, traces, logs, and saved pipeline inputs will be gone.

## Persist state with SQLite

Create one SQLite store and wire it to each capability:

```ts
import { createSqliteSessionStore, Studio } from '@anvia/studio'
import { supportAgent } from './support-agent'
import { triagePipeline } from './triage-pipeline'

const store = createSqliteSessionStore({
  path: '.anvia-studio/studio.sqlite',
})

new Studio([supportAgent, triagePipeline], {
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

The adapter creates the parent directory when necessary and initializes its schema lazily on first access. If you omit `path`, `createSqliteSessionStore()` uses SQLite's `:memory:` database and does not persist across process restarts.

The SQLite adapter implements every Studio store interface. Setting only `stores.sessions` to this adapter also lets Studio reuse it for traces, pipeline logs, and pipeline runs. Listing all four assignments makes that ownership explicit and keeps future store changes easy to review.

## Data written by the SQLite adapter

Studio uses dedicated tables and does not write into your product tables:

| Table | Stored data |
| --- | --- |
| `anvia_studio_sessions` | Session identity, agent, title, metadata, and timestamps. |
| `anvia_studio_session_messages` | Ordered conversation messages. |
| `anvia_studio_session_message_parts` | Structured parts belonging to a message. |
| `anvia_studio_session_runs` | Per-run transcript, status, and error. |
| `anvia_studio_session_logs` | Ordered runtime lifecycle logs. |
| `anvia_studio_traces` | Trace summaries, observations, input, output, errors, and usage. |
| `anvia_studio_pipeline_logs` | Ordered pipeline runtime logs. |
| `anvia_studio_pipeline_runs` | Saved pipeline input, output, status, timing, and metadata. |

The adapter enables SQLite WAL mode and foreign-key enforcement. Deleting a Studio session removes its stored messages, runs, logs, and session traces.

## How store resolution works

The `stores` object lets you replace capabilities independently:

| Option | Default resolution |
| --- | --- |
| `sessions` | Built-in in-memory store; set to `false` to disable sessions. |
| `traces` | Explicit trace store, then a compatible session store, then the built-in in-memory store. Traces are disabled when sessions are disabled and no trace store is supplied. |
| `pipelineLogs` | Explicit store, then a compatible session store, then the built-in store; set to `false` to disable. |
| `pipelineRuns` | Explicit store, then a compatible session or pipeline-log store, then the built-in store; set to `false` to disable. |

A custom session store does not need to implement the other interfaces. Studio fills unsupported trace and pipeline capabilities with its default in-memory store unless you provide explicit alternatives.

## Treat the database as local development data

Add the database file and its WAL companions to `.gitignore`. Session inputs, model outputs, tool results, errors, and trace metadata can contain customer or application data.

SQLite persistence makes local investigation durable; it does not turn Studio into a production observability service. Use [Sessions](/studio/sessions) and [Traces](/studio/traces) for the local workflow, and use [Lens](/lens/) for retained operational telemetry and team investigation.

