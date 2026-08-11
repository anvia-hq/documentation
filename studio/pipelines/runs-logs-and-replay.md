# Runs, logs, and replay

Every Studio execution receives a new run ID. While the pipeline runs, Studio streams stage lifecycle events into the graph and Logs tab. When it finishes, the Runs tab shows the saved output or serialized error.

## What happens when you select Run

Studio performs the following sequence:

```text
Parse editor JSON
      ↓
Create a run with status: running
      ↓
Validate the pipeline input
      ↓
Run stages and append lifecycle logs
      ↓
Save status: success + output
                 or
Save status: error + serialized error
```

The browser requests a streaming run, so logs and graph status can update before the final output arrives. Studio prevents another run or replay from this inspector while one is active.

## Inspect saved runs

Open **Runs** to see the most recent executions for the selected pipeline. A run record contains:

| Field | Meaning |
| --- | --- |
| Run ID | A unique ID created for this execution. |
| Status | `running`, `success`, or `error`. |
| Input | The complete JSON value submitted to the pipeline. |
| Output | The final JSON-compatible value for a successful run. |
| Error | The serialized error for a failed run. |
| Started and ended time | The execution boundaries. |
| Duration | Elapsed milliseconds after the run reaches a terminal state. |
| Metadata | Caller-supplied run metadata. Studio UI runs include `source: 'anvia-studio'`. |

The Studio Runs tab loads the latest 50 records and renders an output or error beneath each one. String outputs appear as text; objects and arrays are formatted as JSON.

Studio converts a pipeline result into a JSON-compatible value before streaming or saving it. Prefer returning ordinary strings, numbers, booleans, arrays, objects, or `null` from a pipeline intended for Studio inspection.

## Read pipeline logs

The Logs tab shows an ordered event stream for the selected pipeline. A typical successful run contains:

```text
pipeline.run_received
pipeline.run_started
step.started
step.completed
agent.started
agent.completed
pipeline.run_completed
```

The exact stage prefix follows the node kind, including `pipeline`, `parallel`, `branch`, `agent`, and `extractor`. Failed stages use `.failed`, and the run ends with `pipeline.run_failed`.

Each log includes a timestamp, level, category, event name, message, run ID, sequence number, and compact metadata. Stage logs include the node ID, kind, label, duration when available, and identifiers such as agent ID, nested pipeline ID, or branch key.

Pipeline logs intentionally do not copy the raw input or output. The request log records details such as input byte length and metadata keys; the completion log records duration and output byte length. A failed log can contain a serialized error, so error messages should still avoid secrets.

Pipeline logs describe workflow boundaries. For model generations and tool calls inside an agent stage, use Studio's trace and session inspection surfaces.

## Replay a saved input

Select **Rerun** on a terminal run to execute its saved input again. Replay:

- reads the original run by pipeline ID and run ID;
- copies its complete saved input;
- creates a new run with a new run ID;
- merges the original and new metadata, with new values taking precedence;
- adds `replayOf` with the source run ID;
- runs the pipeline implementation currently registered in Studio.

Replay is a new execution, not a cached response. It does not restore the original code, model, external data, environment variables, or tool state. This makes replay useful after changing a pipeline, but it also means the output can differ.

Do not replay a workflow with irreversible side effects unless those effects are idempotent or the development environment is isolated. Studio refuses to replay a run that is still `running`.

## Persist history across restarts

Studio enables pipeline logs and run history with an in-memory store by default. They remain available only for the life of the Studio process.

Use the SQLite store to preserve them across restarts:

```ts
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { Studio, createSqliteSessionStore } from '@anvia/studio'

const dbPath = '.anvia-studio/studio.sqlite'
mkdirSync(dirname(dbPath), { recursive: true })

const store = createSqliteSessionStore({ path: dbPath })

new Studio([supportAgent, supportPipeline], {
  stores: {
    sessions: store,
    traces: store,
    pipelineLogs: store,
    pipelineRuns: store,
  },
}).start()
```

`createSqliteSessionStore()` implements all four storage interfaces, so one instance can back sessions, traces, pipeline logs, and pipeline runs. Assigning the same instance explicitly makes that shared persistence visible in configuration.

The two pipeline stores have different privacy implications:

| Store | Retained data |
| --- | --- |
| `pipelineLogs` | Lifecycle events and compact metadata; raw inputs and successful outputs are not copied into normal logs. |
| `pipelineRuns` | Full input, output or error, timing, status, and run metadata needed for history and replay. |

Treat the run database as application data. Choose its location, permissions, retention, and cleanup policy accordingly.

You can set `stores.pipelineLogs` or `stores.pipelineRuns` to `false` for a custom integration that does not expose that capability. Pipeline execution can still run, but the corresponding log or history endpoints are unavailable. Replay requires a run store because it must retrieve the original input.

## Understand failures

Failures appear at different boundaries:

| Failure | Studio behavior |
| --- | --- |
| Invalid JSON in the editor | Shows a client error and does not create a run. |
| Input does not satisfy the pipeline schema | Saves an error run and a run-level failure; no named stage has started. |
| A stage throws or rejects | Marks that node failed, prevents later sequential stages from starting, and saves the run error. Parallel siblings that already started can still emit events. |
| Agent or extractor stage fails | Records the stage failure under its specific node kind, then fails the run. |
| Replay source is missing | Does not start a new run. |
| Replay source is still running | Rejects replay until the source is terminal. |

Studio does not retry a failed pipeline automatically. Fix the input or implementation, then start a new run or replay a saved one. When stages perform writes or other side effects, apply the same idempotency and transaction rules you would use outside Studio.

Return to [Pipelines](/studio/pipelines) for the complete Studio workflow, or read [SDK pipeline runs and errors](/sdk/pipelines/runs-and-errors) for direct `pipeline.run()` observers and error handling.
