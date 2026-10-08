# `@anvia/durable` API reference

```ts
import {
  DurableRuntime,
  DurableRun,
  DurableTaskGraph,
  DurableTaskHandle,
  defineTask,
  DurableConflictError,
  DurableLimitError,
  DurableNotFoundError,
  DurableRecoveryError,
  DurableRunError,
  DurableStorageError,
  type DurableAgentRegistration,
  type DurableRuntimeOptions,
  type DurableSnapshot,
} from '@anvia/durable'
import { SqliteDurableStore } from '@anvia/durable/sqlite'
import { backupSqlite, restoreSqlite } from '@anvia/durable/maintenance'
```

`@anvia/durable/protocol` exports browser-safe validators and types for runs, graphs, and tasks. It is used
by `@anvia/client/durable` and is not normally imported by applications.

## DurableRuntime

```ts
class DurableRuntime {
  static open(options: DurableRuntimeOptions): Promise<DurableRuntime>
  resume(): Promise<void>
  close(): Promise<void>

  // Agent runs
  submit(input: DurableSubmission, options?: DurableSubmitOptions): Promise<DurableRun>
  getRun(id: string): Promise<DurableRun>
  listRuns(options?: DurableListOptions): Promise<DurableRunPage>
  runScope(runId: string): DurableRunScope

  // Registration
  registerAgents(registrations: readonly DurableAgentRegistration[]): void
  unregisterAgent(id: string): boolean

  // Static graphs
  submitGraph(input: DurableGraphSubmission): Promise<DurableTaskGraph>
  getGraph(id: string): Promise<DurableTaskGraph>
  listGraphs(options?: DurableGraphListOptions): Promise<DurableGraphPage>

  // Custom tasks
  submitTask<I, S, R>(
    definition: DefinedTask<I, S, R>,
    input: { sessionId: string; requestId: string; input: I },
  ): Promise<DurableTaskHandle<R>>
  submitRegisteredTask(input: {
    name: string
    version: number
    sessionId: string
    requestId: string
    input: JsonValue
  }): Promise<DurableTaskHandle>
  getTask(id: string): Promise<DurableTaskHandle>
  listTasks(options?: TaskListOptions): Promise<TaskPage>
  taskGraph(id: string): Promise<TaskGraphSnapshot>

  // Operations
  health(): {
    status: 'ready' | 'failed' | 'closing' | 'closed'
    ready: boolean
    activeRuns: number
    activeTasks: number
  }
  metrics(): DurableMetrics
}
```

`DurableRuntimeOptions`:

```ts
type DurableRuntimeOptions = {
  store: DurableStore
  limits?: Partial<DurableLimits>
  onFatalError?: (error: unknown) => void
  agents?: readonly DurableAgentRegistration[]
  tasks?: readonly { readonly registration: RegisteredTask }[]
  maxConcurrentTasks?: number
  maxConcurrentRuns?: number
}
```

`DurableRuntime` also has lower-level methods (`snapshot`, `events`, `respond`, `resolveTool`, `retry`,
`cancel`, `graphSnapshot`, `graphEvents`, `cancelGraph`) that the handles delegate to; prefer the handles.
`runScope()` returns lightweight owner metadata (`runId`, `agentId`, `sessionId`, and optional `graphId`,
`taskId`, `rootTaskId`, `taskName`) for trusted authorization code.

## DurableRun

```ts
class DurableRun {
  readonly id: string
  snapshot(): Promise<DurableSnapshot>
  stream(options?: { after?: number; abortSignal?: AbortSignal }): AsyncIterable<DurableEvent>
  result(options?: { abortSignal?: AbortSignal }): Promise<AgentOutcome<unknown>>
  respond(interactionId: string, response: AgentInteractionResponse): Promise<void>
  resolveTool(operationId: string, output: ToolResultOutput): Promise<void>
  retry(): Promise<void>
  cancel(): Promise<void>
}
```

`stream()` reads committed events after `after` (default 0), polls while idle, and finishes when the run is
`completed`, `failed`, or `cancelled`. It stays open during approvals and recovery blocks and throws a
`TypeError` if the cursor is ahead of the store. `result()` throws `DurableRunError` for a failed or
cancelled run; it does not approve interactions.

## Submission and record types

```ts
type DurableSubmission = {
  agentId: string
  sessionId: string
  requestId: string
  prompt: AgentPrompt // nonblank string or a core user message
}
type DurableSubmitOptions = { enqueue?: boolean }

type DurableAgentRegistration = {
  agent: Agent<unknown>
  version: string
  stream?: boolean
  toolRecovery?: Readonly<Record<string, 'safe' | 'idempotent' | 'manual'>>
  modelRetry?: { maxAttempts: number; initialDelayMs: number; maxDelayMs: number }
}

type DurableRunStatus =
  | 'queued' | 'retry_wait' | 'pending' | 'running' | 'waiting'
  | 'needs_attention' | 'completed' | 'failed' | 'cancelled'

type DurableSnapshot = {
  run: DurableRunRecord
  operations: DurableOperation[]
  cursor: number
}

type DurableEvent = {
  sequence: number
  runId: string
  createdAt: string
  type:
    | 'submitted' | 'status' | 'model_started' | 'model_attempt_started'
    | 'model_delta' | 'model_attempt_failed' | 'model_completed'
    | 'tool_started' | 'tool_completed'
  data: JsonValue
}

type DurableListOptions = {
  sessionId?: string
  agentId?: string
  status?: DurableRunStatus
  after?: number // exclusive insertion cursor, unrelated to event cursors
  limit?: number // at most 100
}
type DurableRunPage = { runs: DurableRunSummary[]; nextCursor?: number }
```

`DurableRunRecord` includes the submission fields plus `id`, `version`, `status`, timestamps, `graphId`,
`taskId`, `dependencies`, `epoch`, `input`, `modelTurns`, `maxModelTurns`, `usage`, `history`, `outcome`,
`error`, `blockedOperation`, `modelRetry`, `nextAttemptAt`, `stream`, and `responses`. `DurableOperation`
has `key`, `kind` (`model`, `tool`, or `effect`), `input`, `status` (`started` or `completed`), `recovery`,
`result`, `attempts`, and `attemptId`.

## Graphs

```ts
type DurableTask = {
  id: string
  agentId: string
  prompt: AgentPrompt
  dependsOn?: readonly string[]
}
type DurableGraphSubmission = {
  sessionId: string
  requestId: string
  tasks: readonly DurableTask[] // 1 to 100
}

class DurableTaskGraph {
  readonly id: string
  snapshot(): Promise<DurableGraphSnapshot>
  stream(options?: { after?: number; abortSignal?: AbortSignal }): AsyncIterable<DurableGraphEvent>
  cancel(): Promise<void>
}
```

`DurableGraphSnapshot` has `id`, `sessionId`, `requestId`, `createdAt`, `status` (`running`, `waiting`,
`blocked`, `completed`, `cancelled`), `nodes` (`DurableGraphNode` with `id`, `agentId`, `runId`, `status`,
`wait`, `output`, `interaction`, `error`), `edges`, and `cursor`. `DurableGraphEvent` is a `DurableEvent`
plus `graphId` and `taskId`. `DurableTaskWait` is one of `dependencies`, `dependency_failed`, `capacity`,
`interaction`, `retry`, or `recovery`.

## Custom tasks

```ts
function defineTask<I, S, R>(definition: TaskDefinition<I, S, R>): DefinedTask<I, S, R>

type TaskDefinition<I, S, R> = {
  name: string
  version: number // positive integer
  input: z.ZodType<I>
  checkpoint: z.ZodType<S>
  output: z.ZodType<R>
  initial: (input: I) => S
  run: (context: TaskContext<I, S>) => Promise<TaskTransition<S, R>>
  migrate?: (input: JsonValue, checkpoint: JsonValue, fromVersion: number) => { input: I; checkpoint: S }
}

type TaskContext<I, S> = {
  readonly id: string
  readonly input: I
  readonly checkpoint: S
  readonly signal: AbortSignal
  spawn(key: string, task: TaskDefinition<CI, CS, CR>, input: CI): string
  spawnAgent(key: string, input: { agentId: string; prompt: AgentPrompt }): string
  children(): TaskRecord[]
  signalValue(name: string): JsonValue | undefined
  effect<T extends JsonValue>(
    key: string,
    input: JsonValue,
    execute: (operationId: string, signal: AbortSignal) => Promise<T>,
    recovery?: 'safe' | 'idempotent' | 'manual',
  ): Promise<T>
}

type TaskWait =
  | { type: 'children'; ids: string[]; policy: 'allSettled' | 'failFast' }
  | { type: 'timer'; until: string }
  | { type: 'agent'; runId: string; status: DurableRunStatus }
  | { type: 'signal'; name: string }

class DurableTaskHandle<R = JsonValue> {
  readonly id: string
  snapshot(): Promise<{ task: TaskRecord; operations: DurableOperation[]; cursor: number }>
  graph(): Promise<TaskGraphSnapshot>
  stream(options?: { after?: number; abortSignal?: AbortSignal }): AsyncIterable<TaskEvent>
  result(options?: { abortSignal?: AbortSignal }): Promise<R>
  signal(name: string, requestId: string, value: JsonValue): Promise<void>
  resolveEffect(key: string, value: JsonValue): Promise<void>
  retry(): Promise<void>
  cancel(options?: { expectedTreeIds?: readonly string[] }): Promise<void>
}
```

Task statuses are `pending`, `running`, `waiting`, `completing`, `cancelling`, `completed`, `failed`,
`cancelled`, and `needs_attention`. `TaskGraphSnapshot` is `{ rootId, nodes, edges, cursor }` with edge types
`owns` and `waits`. The name `anvia.agent` is reserved.

## Errors

| Error | Meaning |
| --- | --- |
| `DurableRunError` | `run.result()` or `task.result()` on a failed or cancelled execution. Has `runId` and `status`. |
| `DurableRecoveryError` | A saved checkpoint no longer matches code, or a manual operation is uncertain. Has `operationId`. |
| `DurableNotFoundError` | Unknown run, graph, or task. |
| `DurableConflictError` | Conflicting submission, duplicate registration, or unregistering an agent that is still needed. |
| `DurableStorageError` | Fatal journal failure. The runtime stops accepting work. |
| `DurableLimitError` | An admission, payload, or operation limit was exceeded. |

## Storage and maintenance

```ts
class SqliteDurableStore implements DurableStore {
  constructor(path: string)
}

function backupSqlite(source: string, destination: string): Promise<DurableBackupInfo>
function restoreSqlite(source: string, destination: string): Promise<DurableBackupInfo>
type DurableBackupInfo = { createdAt: string; schemaVersion: number }
```

`DurableLimits` is `{ maxPendingRuns, maxPendingTasks, maxPayloadBytes, maxOperations }`, and
`DurableMetrics` is `{ observedAt, runs, tasks, oldestPendingAgeMs, operations, events, databaseBytes }`.

## Server and client

```ts
import { createDurableHandler, type DurableAuthorization } from '@anvia/server/durable'
import { DurableClient, DurableHttpError } from '@anvia/client/durable'
```

See [HTTP server and client](/packages/durable/http) for options, routes, and methods.
