# `@anvia/browser` API reference

All public symbols are exported from `@anvia/browser`.

## Client and browser handle

```ts
class DockerBrowserClient {
  constructor(options: DockerBrowserClientOptions)
  pullImage(options?: PullDockerBrowserImageOptions): Promise<void>
  createBrowser(options: CreateDockerBrowserOptions): Promise<DockerBrowser>
  resumeBrowser(options: ResumeDockerBrowserOptions): Promise<DockerBrowser>
}

interface DockerBrowser extends AsyncDisposable {
  readonly id: string
  readonly state: DockerSandboxState
  readonly desktop: BrowserDesktopEndpoint
  readonly sandbox: DockerSandbox
  inspector(options: DockerSandboxInspectionOptions): DockerSandboxInspector
  readiness(): BrowserReadinessSnapshot
  waitForCapabilities(options: BrowserWaitUntilReadyOptions): Promise<BrowserReadinessSnapshot>
  waitUntilReady(options: BrowserWaitUntilReadyOptions): Promise<void>
  connect(options?: BrowserConnectOptions): Promise<PlaywrightBrowserConnection>
  stop(options?: BrowserLifecycleOptions): Promise<void>
  destroy(options?: BrowserLifecycleOptions): Promise<void>
}
```

`DockerBrowser` is a handle returned by the client, not a constructable class.

## Readiness

```ts
type BrowserCapability = 'runtime' | 'browser' | 'automation' | 'desktop'

type BrowserCapabilityState = 'unknown' | 'checking' | 'ready' | 'failed' | 'stopped' | 'destroyed'

interface BrowserCapabilitySnapshot {
  capability: BrowserCapability
  state: BrowserCapabilityState
  checkedAt?: string
  error?: BrowserError
}

interface BrowserReadinessSnapshot {
  state:
    | 'unknown'
    | 'checking'
    | 'partial'
    | 'ready'
    | 'degraded'
    | 'failed'
    | 'stopped'
    | 'destroyed'
  capabilities: Record<BrowserCapability, BrowserCapabilitySnapshot>
}

interface BrowserWaitUntilReadyOptions {
  timeoutMs: number
  abortSignal?: AbortSignal
  capabilities?: readonly [BrowserCapability, ...BrowserCapability[]]
}
```

`readiness()` is synchronous and reports the last known state without probing. `waitForCapabilities()` probes only the requested capabilities (all four when omitted), rejects with `readiness_timeout` when the budget expires, and resolves with a fresh snapshot. A retry replaces the requested capabilities' prior failed state; caller cancellation restores their previous state, and stop or destroy aborts and joins every probe. `partial` means some capabilities are ready while others are unchecked; `degraded` means a checked capability failed while another remains usable. Desktop probing never establishes Playwright, so a failed `automation` probe can leave `desktop` ready and the snapshot degraded. `waitUntilReady()` is a thin wrapper that defaults to all four capabilities.

## Connect options and scheduling

```ts
interface BrowserLifecycleOptions {
  timeoutMs?: number
  abortSignal?: AbortSignal
}

type BrowserSchedulingOptions =
  | { mode: 'serial'; maxQueuedActions?: number }
  | { mode: 'per-tab'; maxConcurrentTabs?: number; maxQueuedActions?: number }

interface BrowserConnectOptions {
  timeoutMs?: number
  abortSignal?: AbortSignal
  scheduling?: BrowserSchedulingOptions
}
```

`connect()` defaults to a 30-second budget and `{ mode: 'serial' }` scheduling, the compatibility mode: every tool call executes in one bounded FIFO queue against the selected tab. `{ mode: 'per-tab' }` overlaps operations on different explicit tabs up to `maxConcurrentTabs` (default 8) while keeping same-tab operations FIFO, with queue admission bounded by `maxQueuedActions` (default 1,000). The scheduling domain is one connection, and a `DockerBrowser` handle permits one active or pending automation connection: a second `connect()` rejects with `agent_action_busy`, so share the connection among agents and disconnect it before creating a replacement. Tab IDs are scoped to one connection; list tabs again after reconnecting.

`connect({ timeoutMs, abortSignal, scheduling })`, `stop({ timeoutMs, abortSignal })`, and `destroy({ timeoutMs, abortSignal })` all accept bounded cancellation.

## Connection and tools

```ts
interface PlaywrightBrowserConnection extends AsyncDisposable {
  readonly closed: boolean
  listTabs(options?: BrowserActionOptions): Promise<readonly BrowserTab[]>
  disconnect(options?: BrowserLifecycleOptions): Promise<void>
}

interface BrowserTab {
  id: string
  title: string
  url: string
  selected: boolean
}

function createBrowserTools(options: CreateBrowserToolsOptions): readonly AnyTool[]
```

Each connection owns a supervised Playwright automation worker child process, one per connection. Playwright and its CDP protocol state run inside that worker as an intentional fault-containment boundary; cancellation, timeout, stop, and destroy terminate and join the worker before the attempt rejects, and a failed attempt owns no state in `DockerBrowser`, so a later call starts a clean attempt.

The page tools `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_press_key`, and `browser_screenshot` accept an optional `tabId`; omitting it uses selected-tab compatibility behavior. Obtain stable IDs from `browser_list_tabs` or `browser_open_tab`, which returns the new tab's stable ID. Cancelling an active page tool closes that tab because Playwright page actions do not accept an `AbortSignal` — obtain a fresh tab ID before retrying. If page cleanup cannot finish, the entire connection closes and must be recreated.

`CreateBrowserToolsOptions.tools` is a required non-empty tuple of `BrowserToolName`. Navigation is either `{ mode: 'allow-all-http' }` or `{ mode: 'origins', origins }`. Optional limits control action timeout, navigation timeout, and maximum snapshot characters.

## Lifecycle

Image pull, create, resume, stop, and destroy accept `timeoutMs` and `abortSignal` with a default budget of 120 seconds; `connect()` defaults to 30 seconds and `disconnect()` to 10. `stop()` first cancels pending readiness and connect work and disconnects every automation worker, then stops the sandbox while preserving the container; it also cancels pending human acquisition and releases an active lease. Destroy remains available after a failed stop.

`destroy()` starts an irreversible terminal transition. It is idempotent, joins pending work, invalidates human-control leases, and removes the sandbox. Docker cleanup cannot currently be cancelled: once it starts, a timeout or cancellation bounds only that caller's wait while the handle remains visibly `destroying` and owns the eventual completion. Later `destroy()` calls join the same cleanup, and late completion can only transition the terminal handle to `destroyed` or `error`. Concurrent stop, destroy, or disconnect calls join the first shared transition; a later caller's own timeout or cancellation bounds its wait without rolling back the already-visible transition.

## Desktop control

`BrowserDesktopEndpoint` exposes the noVNC container port and a `BrowserControl`. Acquire human control with an owner ID and lease timeout, renew the returned `BrowserHumanControlLease`, and release or dispose it when control returns to the agent. Acquisition waits for active agent operations to finish, rejects work that has not entered the control gate with `human_control_conflict`, and rejects agent work with the backward-compatible `human_controlled` while a lease is active; there is never more than one pending waiter or active lease.

`control.snapshot()` returns a race-safe `BrowserControlSnapshot`:

```ts
interface BrowserControlSnapshot {
  mode: 'agent' | 'human'
  state: 'agent' | 'agent-active' | 'human-pending' | 'human'
  availability: 'available' | 'degraded' | 'disconnected' | 'destroyed'
  activeAgentActions: number
  humanPending: boolean
  ownerId?: string
  expiresAt?: string
}
```

## Errors

Operational failures from the public browser lifecycle and tool wrappers reject with `BrowserError`; invalid API arguments still throw `TypeError` or `RangeError`. `BrowserError` extends `Error`, retains the original operational error as `cause`, and exposes:

- `code`: a `BrowserErrorCode` string
- `retryable`: whether the runtime documents a recovery path
- `recovery`: `'none' | 'retry' | 'reconnect' | 'restart' | 'recreate'`
- `capability`: the readiness capability, for readiness failures
- `phase`: the lifecycle or action phase that failed

| Codes | Typical recovery |
| --- | --- |
| `cancelled`, `action_timeout`, `lifecycle_timeout`, `agent_action_busy` | Retry the operation when appropriate. |
| `human_control_conflict`, `human_controlled` | Wait for acquisition, lease release, or expiration. |
| `readiness_timeout`, `not_ready` | Retry the failed capability; inspect `capability`. |
| `connection_timeout`, `connection_closed`, `transport_failure` | Disconnect if needed, then create a new connection. |
| `tool_failed` | Retry the tool if its inputs and tab are still valid. |
| `invalid_state` | Refresh tabs and state; restart when the runtime is stopped or errored. |
| `navigation_blocked` | Do not retry unchanged input; update the explicit policy or URL. |
| `startup_failed` | Recreate the runtime after fixing image or runtime configuration. |
| `runtime_destroyed` | Create or resume a new runtime handle. |

Prefer `error.retryable` and `error.recovery` over a closed switch on `error.code`. The legacy `not_ready` and `human_controlled` codes remain in the public union: bounded connection and readiness operations use the more specific `connection_timeout` and `readiness_timeout`, and pending human acquisition uses `human_control_conflict`. `retryable` does not make a mutating tool call idempotent — after a timeout or transport loss, inspect or refresh tab state before deciding whether replaying navigation, typing, clicking, or key input is safe.
