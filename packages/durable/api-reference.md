# `@anvia/durable` API reference

```ts
import {
  DurableRuntime,
  DurableWorker,
  DurableClient,
  DurableObserver,
  DurableRun,
  DurableRunView,
  DurableTaskGraph,
  DurableTaskHandle,
  DurableAgentHandle,
  defineTask,
  defineGoal,
  agentVersion,
  isDurableEvent,
  DurableConflictError,
  DurableLimitError,
  DurableNotFoundError,
  DurableBlockedError,
  DurableClaimLostError,
  DurableRecoveryError,
  DurableRunError,
  DurableStorageError,
  type DurableAgentRegistration,
  type DurableRuntimeOptions,
  type DurableLimits,
  type DurableSnapshot,
} from '@anvia/durable'
import { SqliteDurableStore } from '@anvia/durable/sqlite'
import { PostgresDurableStore } from '@anvia/durable/postgres'
import { backupSqlite, restoreSqlite } from '@anvia/durable/maintenance'
```

`@anvia/durable/protocol` exports browser-safe validators and types for runs, graphs, and tasks. It is used
by `@anvia/client/durable` and is not normally imported by applications. SQL backends live in separate
subpaths so the root never imports `pg`, `drizzle-orm`, or `@prisma/client`.

## Stores

```ts
new SqliteDurableStore(path, { readOnly?: boolean })
new PostgresDurableStore({ pool } | { connectionString }, { schema: 'verify' | 'create' })
new DrizzleDurableStore(db, { /* schema is verified; generate it with the CLI */ })
new PrismaDurableStore(client, { /* schema is verified; generate it with the CLI */ })
```

Only SQLite creates its schema automatically. For Drizzle and Prisma, run `anvia-durable-drizzle init` or
`anvia-durable-prisma init` to add the tables or models, then apply your normal migration workflow. Store
interfaces are asynchronous.

## DurableRuntime

```ts
class DurableRuntime {
  static open(options: DurableRuntimeOptions): Promise<DurableRuntime>
  resume(): Promise<void>
  close(): Promise<void>

  // Agent runs
  submit(input: DurableSubmission, options?: DurableSubmitOptions): Promise<DurableRun>
  getRun(id: string): Promise<DurableRun>
  run(id: string): Promise<DurableRunRecord>
  status(id: string): Promise<DurableRunSummary>
  operationRequest(id: string, key: string): Promise<CompletionRequest>
  steer(id: string, input: AgentSteerInput, options?: DurableSteerOptions): Promise<AgentSteerReceipt>
  listRuns(options?: DurableListOptions): Promise<DurableRunPage>
  runScope(runId: string): Promise<DurableRunScope>
  agent(registration: DurableAgentRegistration): DurableAgentHandle
  handle(agent: Agent): DurableAgentHandle

  // Registration
  registerAgents(registrations: readonly DurableAgentRegistration[]): void
  unregisterAgent(id: string): Promise<boolean>
  compatibility(): readonly DurableAgentCompatibility[]
  limits(): DurableLimits

  // Static graphs
  submitGraph(input: DurableGraphSubmission): Promise<DurableTaskGraph>
  getGraph(id: string): Promise<DurableTaskGraph>
  listGraphs(options?: DurableGraphListOptions): Promise<DurableGraphPage>
  graphSnapshot(id: string): Promise<DurableGraphSnapshot>
  graphEvents(id: string, after: number): Promise<DurableEvent[]>
  cancelGraph(id: string): Promise<void>

  // Custom tasks and goals
  submitTask<I, S, R>(
    definition: DefinedTask<I, S, R>,
    input: { sessionId: string; requestId: string; input: I; trace?: DurableTraceOptions },
  ): Promise<DurableTaskHandle<R>>
  submitRegisteredTask(input: TaskSubmission): Promise<DurableTaskHandle>
  submitGoal(definition: DefinedGoal, input: GoalInput & {
    sessionId: string; requestId: string; trace?: DurableTraceOptions
  }): Promise<DurableTaskHandle<GoalResult>>
  getTask(id: string): Promise<DurableTaskHandle>
  listTasks(options?: TaskListOptions): Promise<TaskPage>
  taskGraph(id: string): Promise<TaskGraphSnapshot>

  // Operations
  health(): { status: 'ready' | 'failed' | 'closing' | 'closed'; ready: boolean; activeRuns: number; activeTasks: number }
  metrics(): Promise<DurableMetrics>
}
```

`DurableRuntimeOptions`:

```ts
type DurableRuntimeOptions = {
  store: DurableStore
  limits?: Partial<DurableLimits>
  onFatalError?: (error: unknown) => void
  onCompatibility?: (reports: readonly DurableAgentCompatibility[]) => void
  agents?: readonly DurableAgentRegistration[]
  tasks?: readonly { readonly registration: RegisteredTask }[]
  maxConcurrentTasks?: number
  maxConcurrentRuns?: number
  pollIntervalMs?: number
  worker?: { workerId: string; leaseMs?: number; heartbeatMs?: number }
}
```

`runScope()` returns owner metadata (`runId`, `agentId`, `sessionId`, and optional `graphId`, `taskId`,
`rootTaskId`, `taskName`) for trusted authorization code.

## DurableWorker

```ts
class DurableWorker {
  static start(options: DurableWorkerStartOptions): Promise<DurableWorker>
  readonly workerId: string
  registerAgents(values: readonly DurableAgentRegistration[]): void
  unregisterAgent(id: string): Promise<boolean>
  compatibility(): readonly DurableAgentCompatibility[]
  limits(): DurableLimits
  health(): { status: string; ready: boolean; activeRuns: number; activeTasks: number }
  metrics(): Promise<DurableMetrics>
  close(): Promise<void>
}
```

A worker executes claimed runs, graphs, tasks, and goals and exposes no submit or control methods. Start
several workers on one SQL database; one that stops lets its runs be taken over after the lease lapses. A
worker cannot share a database with an owning runtime.

## DurableClient and DurableObserver

```ts
class DurableClient {
  static connect(options: { store: DurableStore }): Promise<DurableClient>
  submit(input: DurableSubmission, options?: DurableSubmitOptions): Promise<DurableRun>
  getRun(id: string): Promise<DurableRun>
  status(id: string): Promise<DurableRunSummary>
  snapshot(id: string, options?: { operations?: boolean }): Promise<DurableSnapshot>
  events(id: string, after: number): Promise<DurableEvent[]>
  listRuns(options?: DurableListOptions): Promise<DurableRunPage>
  runScope(runId: string): Promise<DurableRunScope>
  steer(id: string, input: AgentSteerInput, options?: DurableSteerOptions): Promise<AgentSteerReceipt>
  respond(id: string, interactionId: string, value: AgentInteractionResponse): Promise<void>
  resolveTool(id: string, operationId: string, output: ToolResultOutput): Promise<void>
  resolveMemoryWrite(id: string, operationKey: string, resolution: MemoryWriteResolution): Promise<void>
  retry(id: string): Promise<void>
  cancel(id: string): Promise<void>
  submitGraph(input: DurableGraphSubmission): Promise<DurableTaskGraph>
  getGraph(id: string): Promise<DurableTaskGraph>
  graphSnapshot(id: string): Promise<DurableGraphSnapshot>
  graphEvents(id: string, after: number): Promise<DurableEvent[]>
  listGraphs(options?: DurableGraphListOptions): Promise<DurableGraphPage>
  cancelGraph(id: string): Promise<void>
  submitRegisteredTask(input: TaskSubmission): Promise<DurableTaskHandle>
  getTask(id: string): Promise<DurableTaskHandle>
  listTasks(options?: TaskListOptions): Promise<TaskPage>
  taskGraph(id: string): Promise<TaskGraphSnapshot>
  close(): Promise<void>
}

class DurableObserver {
  static connect(options: { store: DurableStore }): Promise<DurableObserver>
  getRun(id: string): Promise<DurableRunView>
  listRuns(options?: DurableListOptions): Promise<DurableRunPage>
  run(id: string): Promise<DurableRunRecord>
  status(id: string): Promise<DurableRunSummary>
  snapshot(id: string, options?: { operations?: boolean }): Promise<DurableSnapshot>
  events(id: string, after: number): Promise<DurableEvent[]>
  close(): Promise<void>
}
```

A client holds no agents and no lease, so it needs no registration. It can submit tasks by registered name
but not by definition. An observer opens the store read-only; SQLite requires a store constructed with
`{ readOnly: true }` and a schema a runtime already initialised.

## DurableRun

```ts
class DurableRunView<Output = unknown> {
  readonly id: string
  status(): Promise<DurableRunSummary>
  snapshot(options?: { operations?: boolean }): Promise<DurableSnapshot>
  stream(options?: { after?: number; abortSignal?: AbortSignal }): AsyncIterable<DurableEvent>
  result(options?: { abortSignal?: AbortSignal; onBlocked?: 'wait' | 'throw' }): Promise<AgentOutcome<Output>>
}

class DurableRun<Output = unknown> extends DurableRunView<Output> {
  steer(input: AgentSteerInput, options?: DurableSteerOptions): Promise<AgentSteerReceipt>
  respond(interactionId: string, response: AgentInteractionResponse): Promise<void>
  resolveTool(operationId: string, output: ToolResultOutput): Promise<void>
  resolveMemoryWrite(operationKey: string, resolution: 'applied' | 'discarded'): Promise<void>
  retry(): Promise<void>
  cancel(): Promise<void>
}
```

`stream()` reads committed events after `after` (default 0), polls while idle, and finishes when the run is
`completed`, `failed`, or `cancelled`. It stays open during approvals and recovery blocks and throws a
`TypeError` if the cursor is ahead of the store. `result()` waits through `needs_attention` by default;
`onBlocked: 'throw'` rejects with `DurableBlockedError` instead. It does not approve interactions.

`resolveMemoryWrite` settles a recorded memory write that blocked: `'applied'` means the store already holds
the messages, `'discarded'` drops them, and either way the run sends its remaining writes without a version
check and completes.

`DurableAgentHandle`, returned by `runtime.agent()` or `runtime.handle()`, submits without an `agentId` string
and returns a `DurableRun` typed from the agent:

```ts
const handle = runtime.handle(researcher)
const run = await handle.submit({
  sessionId: 'research-session',
  requestId: 'research-job-42',
  prompt: 'Summarize these notes.',
})
```

## Submission and record types

```ts
type DurableSubmission = {
  agentId: string
  sessionId: string
  requestId: string
  prompt: AgentPrompt // nonblank string or a core user message
  trace?: DurableTraceOptions
}
type DurableSubmitOptions = { enqueue?: boolean }

type DurableAgentRegistration = {
  agent: Agent<unknown>
  version: string | 'auto'
  stream?: boolean
  toolRecovery?: Readonly<Record<string, 'safe' | 'idempotent' | 'manual'>>
  toolConcurrency?: number
  modelRetry?: { maxAttempts: number; initialDelayMs: number; maxDelayMs: number }
  compaction?: DurableCompactionOptions
  memory?: { mode: 'recorded' }
  context?: { mode: 'recorded' }
  middlewares?: { mode: 'pure' }
  guardrails?: { mode: 'record' }
  hooks?: { mode: 'record' }
  lifecycle?: { mode: 'observe' }
  mcpServers?: { mode: 'pinned' }
  providerTools?: { mode: 'stateless' }
  toolIndexes?: { mode: 'recorded' }
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
    | 'compaction_started' | 'compaction_completed'
    | 'steering_queued' | 'steering_applied'
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

`isDurableEvent(event, 'model_delta')` narrows a `DurableEvent` by type and types its payload, with
`DurableEventPayloads`, `DurableEventOf`, and `DurableEventType`. The guard checks the type tag only and does
not validate the payload. `agentVersion(agent)` returns the fingerprint used by `version: 'auto'`.
