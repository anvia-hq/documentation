# `@anvia/sandbox` API reference

All public runtime symbols are exported from `@anvia/sandbox`. Remote and daemon pieces are subpath exports, so Docker-only applications do not load `ws`.

## Client and lifecycle

```ts
class DockerSandboxClient {
  constructor(options?: { dockerPath?: string })
  hasImage(options: HasDockerImageOptions): Promise<boolean>
  pullImage(options: PullDockerImageOptions): Promise<void>
  ensureImage(options: EnsureDockerImageOptions): Promise<{ pulled: boolean }>
  listSandboxes(options?: ListDockerSandboxesOptions): Promise<readonly DockerSandboxSummary[]>
  destroySandbox(options: DestroyDockerSandboxOptions): Promise<void>
  createSandbox(options: CreateDockerSandboxOptions): Promise<DockerSandbox>
  resumeSandbox(options: ResumeDockerSandboxOptions): Promise<DockerSandbox>
}

interface DockerSandbox extends AsyncDisposable {
  readonly id: string
  readonly runtime: DockerSandboxRuntime
  readonly state: DockerSandboxState
  inspector(options: DockerSandboxInspectionOptions): DockerSandboxInspector
  stop(options?: StopDockerSandboxOptions): Promise<void>
  destroy(): Promise<void>
  [Symbol.asyncDispose](): Promise<void>
}
```

`DockerSandbox` is a public handle interface, not a constructable export. Create handles through `DockerSandboxClient`.

```ts
type CreateDockerSandboxOptions = {
  id?: string
  image: string
  pull?: DockerImagePullPolicy // 'never' | 'if-missing' | 'always'; default 'never'
  workdir?: string
  containerRuntime?: string
  workspace: { type: 'ephemeral' } | { type: 'docker-volume'; name: string }
  network: { mode: 'none' } | { mode: 'bridge'; ports?: readonly number[] }
  files?: Readonly<Record<string, string | Uint8Array>>
  directories?: readonly string[]
  env?: Readonly<Record<string, string>>
  user?: string
  labels?: Readonly<Record<string, string>>
  resources?: DockerSandboxResources
  runtime?: DockerSandboxRuntimeLimits
  security?: DockerSandboxSecurity
  abortSignal?: AbortSignal
}
```

Named volumes must already exist. `pull` (type `DockerImagePullPolicy`) decides how `createSandbox()` acquires the image: `'never'`, the default, requires a local image; `'if-missing'` pulls only when it is absent, like `ensureImage()`; `'always'` pulls before every create, like `pullImage()`. `pullImage()` is the explicit image acquisition operation. `hasImage()` checks for a local image without pulling, and `ensureImage()` pulls only when the image is missing, resolving `{ pulled }`. `listSandboxes()` returns a `DockerSandboxSummary` (`id`, `containerName`, `image`, `state`, `status`, and optional `workdir`, `workspaceType`, `networkMode`) for each sandbox container. `destroySandbox({ id, ignoreNotFound? })` removes a container by id without a live handle, which suits cleanup after a restart; with `ignoreNotFound: true` it does not throw `sandbox_not_found`.

## Neutral runtime

`SandboxRuntime` is the provider-neutral contract used by `createSandboxTools()`:

```ts
interface SandboxRuntime {
  readonly id: string
  readonly provider: string
  readonly workdir: string
  readonly publishedPorts: readonly SandboxPublishedPort[]

  exec(options: SandboxExecOptions): Promise<SandboxExecResult>
  execText(options: SandboxExecOptions): Promise<SandboxExecTextResult>
  execStream(options: SandboxExecOptions): AsyncIterable<SandboxExecStreamEvent>
  readFile(options: SandboxReadFileOptions): Promise<Uint8Array>
  readTextFile(options: SandboxReadFileOptions): Promise<string>
  readTextFilePage(options: SandboxReadTextFilePageOptions): Promise<SandboxTextFilePage>
  writeFile(options: SandboxWriteFileOptions): Promise<void>
  writeTextFile(options: SandboxWriteTextFileOptions): Promise<void>
  listFiles(options?: SandboxListFilesOptions): Promise<readonly SandboxFileEntry[]>
  startProcess(options: SandboxProcessStartOptions): Promise<SandboxProcessInfo>
  listProcesses(options?: SandboxListProcessesOptions): Promise<readonly SandboxProcessInfo[]>
  readProcessLogs(options: SandboxReadProcessLogsOptions): Promise<SandboxProcessLogs>
  stopProcess(options: SandboxStopProcessOptions): Promise<SandboxProcessInfo>
  waitForPort(options: SandboxWaitForPortOptions): Promise<SandboxPortStatus>
}
```

`SandboxPortStatus` reports `containerPort` and `protocol`. Its `host` and `hostPort` are optional because a remote runtime has no host-reachable endpoint. Mutating methods accept an optional `operationId`; a runtime that supports it executes each id once.

`execText()` runs a command like `exec()` but returns `stdout` and `stderr` as decoded strings, with `durationMs`, `stdoutTruncated`, `stderrTruncated`, and `status: 'exited' | 'timed_out'` (only the exited form has `exitCode`). Paths that are absolute inside the sandbox workdir are accepted wherever a runtime takes a path. Custom `SandboxRuntime` implementations must provide `execText()`.

## Runtime

`DockerSandboxRuntime` extends `SandboxRuntime` with `provider: 'docker'` and a narrower `waitForPort()` that returns `SandboxPublishedPort`. It exposes:

- `exec()` and `execStream()` for commands;
- `readFile()`, `readTextFile()`, `readTextFilePage()`, `writeFile()`, `writeTextFile()`, and `listFiles()`;
- `startProcess()`, `listProcesses()`, `readProcessLogs()`, and `stopProcess()`;
- `publishedPorts` and `waitForPort()`.

Every method receives one options object. Binary command output and process logs are `Uint8Array`. `DockerSandboxExecResult` is discriminated by `status: 'exited' | 'timed_out'`; only the exited form has `exitCode`.

The related public type families are `DockerSandboxExec*`, `DockerSandboxRead*`, `DockerSandboxWrite*`, `DockerSandboxFile*`, `DockerSandboxProcess*`, `DockerSandboxPublishedPort`, and `DockerSandboxWaitForPortOptions`.

## Read-only inspection

```ts
const inspector = sandbox.inspector({
  files: true,
  ports: true,
  processes: true,
})
```

At least one capability must be enabled. The returned `DockerSandboxInspector` exposes only the requested read surfaces and can be registered with development tooling such as Studio.

## Agent tools

```ts
function sandboxToolkit(options: SandboxToolkitOptions): import('@anvia/core/tool').Toolkit

type SandboxToolkitOptions = import('@anvia/core/tool').ToolkitOptions<SandboxToolName> & {
  sandbox: SandboxRuntime | DockerSandbox
  exec?: SandboxExecToolPolicy
  readFile?: SandboxReadFileToolPolicy
  writeFile?: SandboxFileToolPolicy
  process?: SandboxProcessToolPolicy
  studio?: false | SandboxStudioDiscoveryOptions
}

type SandboxStudioDiscoveryOptions = {
  files?: boolean // default true
  ports?: boolean // default true
  processes?: boolean // default true
  disposeOnShutdown?: boolean // default false
}
```

`sandboxToolkit()` is the recommended way to give an agent sandbox tools. It builds the tools with `createSandboxTools()` and wraps them in a `Toolkit` named `sandbox` with default instructions. Select tools with `include` and `exclude` instead of a `tools` tuple; `prefix`, `requiresApproval`, `timeoutMs`, and `instructions` follow the core `ToolkitOptions` rules.

`studio` controls the metadata that lets `@anvia/studio` discover the sandbox from the agent's tools. `false` omits it. `files`, `ports`, and `processes` choose the inspection surfaces, and at least one must stay enabled. `disposeOnShutdown: true` lets Studio destroy the sandbox during `studio.shutdown()`; it requires the `DockerSandbox` handle and throws for a bare `SandboxRuntime`, including `sandbox.runtime`.

```ts
function createDockerSandboxTools(
  options: CreateDockerSandboxToolsOptions,
): readonly import('@anvia/core/tool').AnyTool[]
```

`options.sandbox` accepts a `DockerSandboxRuntime` or the `DockerSandbox` handle itself. `options.tools` is an optional, ordered, non-empty tuple of `DockerSandboxToolName`; when omitted, every sandbox tool is registered. Supported names are command, file, port, and process operations. The policy families are `DockerSandboxExecToolPolicy`, `DockerSandboxReadFileToolPolicy`, `DockerSandboxFileToolPolicy`, and `DockerSandboxProcessToolPolicy`.

Command policies are discriminated allow or block lists:

```ts
type DockerSandboxCommandPolicy =
  | { mode: 'allow'; values: readonly string[] }
  | { mode: 'block'; values: readonly string[] }
```

`createSandboxTools()` has the same signature and accepts any `SandboxRuntime`:

```ts
function createSandboxTools(
  options: CreateSandboxToolsOptions,
): readonly import('@anvia/core/tool').AnyTool[]
```

Its `sandbox` option accepts a `SandboxRuntime` or a `DockerSandbox` handle, and `tools` defaults to all tool names. Both lower-level factories accept the same `studio` option as `sandboxToolkit()` and attach the same discovery metadata. It uses the neutral option and policy types `CreateSandboxToolsOptions`, `SandboxToolName`, `SandboxCommandPolicy`, `SandboxExecToolPolicy`, `SandboxReadFileToolPolicy`, `SandboxFileToolPolicy`, and `SandboxProcessToolPolicy`. `createDockerSandboxTools()` is a wrapper around it. Both forward `ToolCallContext.operationId` to mutating runtime calls.

```ts
const sandboxToolRecovery: Readonly<Record<SandboxToolName, 'safe' | 'idempotent'>>
```

`sandboxToolRecovery` is the table to spread into a durable registration's `toolRecovery`: read-only tools are `safe`, while `exec_command`, `write_file`, `start_process`, and `stop_process` are `idempotent` on runtimes that deduplicate by `operationId`, such as `RemoteSandboxRuntime`.

### Desktop tools

```ts
function desktopToolkit(options: DesktopToolkitOptions): import('@anvia/core/tool').Toolkit

type DesktopToolkitOptions = import('@anvia/core/tool').ToolkitOptions<DesktopToolName> & {
  sandbox: SandboxDesktop
  settleMs?: number
  screenshot?: DesktopScreenshotPolicy
  studio?: false | DesktopStudioDiscoveryOptions // { id?: string; label?: string }
}

function createDesktopTools(
  options: CreateDesktopToolsOptions,
): readonly import('@anvia/core/tool').AnyTool[]

const desktopToolRecovery: Readonly<Record<DesktopToolName, 'safe' | 'idempotent'>>
```

`options.sandbox` is a `SandboxDesktop` such as `hub.desktop(id)`. `tools` defaults to all nine names: `desktop_screenshot`, `desktop_click`, `desktop_mouse_move`, `desktop_drag`, `desktop_scroll`, `desktop_type`, `desktop_key`, `desktop_cursor_position`, and `desktop_wait`. `settleMs` (300 by default) delays input tools so the application can react; `screenshot: { maxEdge, maxPixels }` changes the image limits.

`desktopToolkit()` wraps the same tools in a `Toolkit` named `desktop`, selected with `include` and `exclude`. Both desktop factories attach a Studio desktop view to their tools, with view id `desktop` and label `Desktop` unless `studio: { id, label }` sets them; `studio: false` omits it.

`desktopToolRecovery` is the table to spread into a durable registration's `toolRecovery`: screenshots, the cursor position, and waiting are `safe`; every input is `idempotent`.

## Remote runtime

Remote exports come from `@anvia/sandbox/remote`:

```ts
class RemoteSandboxHub implements AsyncDisposable {
  constructor(options: RemoteSandboxHubOptions)
  runtime(sandboxId: string, options?: { workdir?: string }): SandboxRuntime
  terminal(sandboxId: string): SandboxTerminal
  tunnel(sandboxId: string): SandboxTunnel
  desktop(sandboxId: string): SandboxDesktop
  connected(): string[]
  isConnected(sandboxId: string): boolean
  capabilities(sandboxId: string): readonly string[] | undefined
  waitForConnection(sandboxId: string, options?: WaitForConnectionOptions): Promise<void>
  forget(sandboxId: string): void
  listen(options?: RemoteSandboxHubListenOptions): Promise<{ port: number }>
  attach(server: http.Server, options?: RemoteSandboxHubAttachOptions): () => void
  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void
  handleTerminalUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void
  handleTunnelUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void
  handleDesktopUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void
  close(): Promise<void>
  [Symbol.asyncDispose](): Promise<void>
}
```

`capabilities()` returns the capability list the sandbox's live daemon advertised, or `undefined` when it is not connected. `waitForConnection()` resolves once a daemon is connected and otherwise fails with `sandbox_unavailable` after `timeoutMs` (default: the hub's `connectTimeoutMs`) or when `abortSignal` fires. `attach()` routes WebSocket upgrades on an existing `http.Server` and returns a function that detaches the listener; `RemoteSandboxHubAttachOptions` has `path`, `terminalPath`, `tunnelPath`, `desktopPath`, and `rejectUnmatched`, and by default leaves unmatched upgrade paths for other handlers.

`RemoteSandboxHubOptions` controls authorization and link limits:

| Option | Meaning |
| --- | --- |
| `authorize(token)` | Required. Resolve a daemon bearer token to `{ sandboxId }`, or return `null` to refuse the upgrade with 401. |
| `connectTimeoutMs` | How long a call waits for a disconnected daemon. Default 30 seconds. |
| `heartbeatIntervalMs` | Application-level ping interval. Default 15 seconds. |
| `handshakeTimeoutMs` | How long a connected socket may take to send `hello`. Default 10 seconds. |
| `maxPayloadBytes` | Largest frame accepted from a daemon. Default 64 MiB. |
| `maxStreamBufferBytes` | Bytes an `execStream` consumer may lag by before the stream aborts. Default 1 MiB. |
| `maxTerminalBufferBytes` | Unread terminal output before a handle is cut off. Default 1 MiB. |
| `maxTunnelBufferBytes` | Unread tunnel bytes before a handle is cut off. Default 1 MiB. |
| `binaryData` | Allow binary tunnel frames with daemons that support them. Default `true`. |
| `authorizeTerminal(request)` | Browser terminal authorizer. Required for `handleTerminalUpgrade`. |
| `authorizeTunnel(request)` | Browser tunnel authorizer. Required for `handleTunnelUpgrade`. |
| `authorizeDesktop(request)` | Browser desktop authorizer. Required for `handleDesktopUpgrade`. |
| `onConnect(event)` | Called after a daemon completes its handshake, with `RemoteSandboxConnectEvent` (`sandboxId`, `workdir`, `daemonVersion`, `capabilities`). |
| `onDisconnect(event)` | Called when a daemon disconnects, with `RemoteSandboxDisconnectEvent` (`sandboxId`, `replaced`). `replaced` is true when a newer daemon took over the sandbox. |
| `onError(error, context)` | Called when an authorizer throws or a handshake, terminal, tunnel, or desktop operation fails. `RemoteSandboxHubErrorContext` has `stage` and an optional `sandboxId`. |
| `allowedOrigins` | Browser origins allowed to open terminal, tunnel, or desktop relays. Without a list, the Origin must match `Host`. |

`RemoteSandboxHubListenOptions` contains `port`, `host`, `path`, `terminalPath`, `tunnelPath`, and `desktopPath`. `RemoteSandboxAuthorization` is the `{ sandboxId }` result of `authorize`.

`RemoteSandboxRuntime` implements `SandboxRuntime` with `provider: 'remote'`. Obtain it from `hub.runtime(id)`; `RemoteSandboxRuntimeOptions` is its constructor type. The hub does not create, stop, or destroy sandboxes and does not issue daemon tokens.

Terminal, tunnel, and desktop capabilities are separate interfaces:

```ts
interface SandboxTerminal {
  open(options: TerminalOpenOptions): Promise<TerminalHandle>
  list(options?: { abortSignal?: AbortSignal }): Promise<readonly TerminalSessionInfo[]>
  kill(sessionName: string, options?: { abortSignal?: AbortSignal }): Promise<void>
}

interface SandboxTunnel {
  open(port: number, options?: TunnelOpenOptions): Promise<TunnelHandle>
}

interface SandboxDesktop {
  status(options?: DesktopCallOptions): Promise<DesktopStatus>
  start(options?: DesktopCallOptions): Promise<DesktopStatus>
  resize(width: number, height: number, options?: DesktopInputOptions): Promise<DesktopStatus>
  screenshot(options?: DesktopCallOptions & { scale?: number }): Promise<DesktopScreenshot>
  cursorPosition(options?: DesktopCallOptions): Promise<{ x: number; y: number }>
  act(action: DesktopAction, options?: DesktopInputOptions): Promise<void>
  control(options?: DesktopCallOptions): Promise<DesktopControl>
  takeover(options: { holder: string; leaseMs?: number } & DesktopInputOptions): Promise<DesktopControl>
  release(options?: { holder?: string; force?: boolean } & DesktopInputOptions): Promise<DesktopControl>
  openViewer(options?: DesktopCallOptions): Promise<TunnelHandle>
}
```

Related public types are `TerminalHandle`, `TerminalExit`, `TerminalSessionInfo`, `TerminalAuthorization`, `TunnelHandle`, `TunnelExit`, `TunnelAuthorization`, `DesktopAction`, `DesktopCallOptions`, `DesktopInputOptions`, `DesktopControl`, `DesktopScreenshot`, `DesktopStatus`, `DesktopAuthorization`, and `RemoteSandboxTerminalOptions`, `RemoteSandboxTunnelOptions`, `RemoteSandboxDesktopOptions`.

Relay helpers for browser upgrades:

| Export | Purpose |
| --- | --- |
| `relayTicket(request)` | Read the ticket from the `anvia.ticket.<ticket>` subprotocol or `?ticket=`. |
| `terminalTicket` | Alias of `relayTicket`, kept for earlier terminal examples. |
| `originAllowed(request, allowedOrigins)` | Apply the Origin rule used by all browser relays. |
| `createRelayTicketStore(options?)` | Create an in-memory `RelayTicketStore<Grant>` of single-use, expiring tickets (`ttlMs` default 30 seconds, `maxEntries` default 10,000). Its `mint(grant)`, `redeem(ticket)`, `redeemRequest(request)`, `revoke(ticket)`, `clear()`, and `size` back `authorizeTerminal`, `authorizeTunnel`, and `authorizeDesktop`. |
| `terminalSubprotocol`, `tunnelSubprotocol`, `desktopSubprotocol` | Subprotocol names the relays select. |

Studio registration helpers:

```ts
function studioSandbox(
  sandbox: DockerSandbox | SandboxRuntime,
  options?: LocalStudioSandboxOptions,
): StudioSandbox

function studioSandbox(
  hub: RemoteSandboxHub,
  sandboxId: string,
  options?: StudioSandboxOptions,
): StudioSandbox

function studioDesktopView(
  desktop: SandboxDesktop,
  options?: { id?: string; label?: string },
): StudioDesktopView
```

Both helpers are exported from `@anvia/sandbox` and `@anvia/sandbox/remote`.

With a local `DockerSandbox` or `SandboxRuntime`, `studioSandbox()` returns a read-only inspector. `LocalStudioSandboxOptions` contains `agentIds`, `toolNames`, `files`, `ports`, `processes` (each default `true`, at least one enabled), and `disposeOnShutdown` (default `false`, `DockerSandbox` handles only), which sets the registration's `dispose` to `sandbox.destroy()`.

With a hub and sandbox ID, `studioSandbox()` returns a read-only inspector for files, processes, and logs plus a live desktop view. It never sets `dispose`. `StudioSandboxOptions` contains `agentIds`, `toolNames`, `workdir`, and `desktop` (`false` to omit the view, or `{ id, label }`). The view is registered with local access and no authentication.

`PROTOCOL_VERSION` is exported for diagnostics; applications should use the hub and daemon rather than crafting frames.

## Daemon

Daemon exports come from `@anvia/sandbox/daemon`:

```ts
class SandboxDaemon {
  constructor(options: SandboxDaemonOptions)
  readonly connected: boolean
  start(): void
  ready(): Promise<void>
  stop(): Promise<void>
  [Symbol.asyncDispose](): Promise<void>
}
```

`SandboxDaemonOptions` requires `controlUrl`, `token`, `workdir`, and `stateDir`. Optional fields are `limits`, `terminal`, `tunnel`, `desktop`, `env`, `maxOperations`, `maxStoredResultBytes`, `reconnect`, `handshakeTimeoutMs`, `binaryData`, `maxPayloadBytes`, `version`, and `onLog`. The related types are `SandboxDaemonTerminalOptions`, `SandboxDaemonTunnelOptions`, `SandboxDaemonDesktopOptions`, and `SandboxDaemonLogLevel`; the terminal PTY extension points are `PtySpawner`, `PtySpawnOptions`, and `PtyProcess`.

The `anvia-sandbox-daemon` executable reads the same required values from `ANVIA_CONTROL_URL` and `ANVIA_SANDBOX_TOKEN`, with `ANVIA_SANDBOX_WORKDIR` and `ANVIA_SANDBOX_STATE_DIR` for local paths. Set `ANVIA_SANDBOX_TUNNEL=0` to turn TCP tunnels off, or `ANVIA_SANDBOX_TUNNEL_ALLOWED_PORTS` to a comma-separated list of loopback ports tunnels may reach. The executable accepts `--check`, `--require`, `--help`, and `--version`, and exits with status 2 on an unknown flag or on `--require` without `--check`.

## CLI

`anvia-sandbox create-image` accepts `--from <dir|manifest>` to build from an existing manifest or directory and `--version` to print the package version. A non-interactive run needs `--name` and at least one `--runtime` or `--feature`, or `--from`.

## Errors

`SandboxError` is the provider-neutral name for `DockerSandboxError`; both are exported from `@anvia/sandbox` and `@anvia/sandbox/remote`, as are `SandboxErrorCode`, `DockerSandboxErrorCode`, and the code lists `sandboxErrorCodes` and `dockerSandboxErrorCodes`. `isSandboxError(error, code?)` narrows an unknown value and, when given a code, also checks it:

```ts
import { isSandboxError } from '@anvia/sandbox'

try {
  await client.createSandbox(options)
} catch (error) {
  if (isSandboxError(error, 'docker_unavailable')) {
    console.error('Start Docker, then retry.')
  } else {
    throw error
  }
}
```

`DockerSandboxError` exposes a `code` and optional `details`. Docker CLI failures include a redacted stderr snippet in the message. `DockerSandboxErrorCode` includes Docker availability and command failures, missing images or volumes, missing or invalid sandbox state, invalid paths, timeouts, oversized files, tool-policy failures, ports, and processes. Remote links add `sandbox_unavailable`, `unsupported`, `desktop_locked`, and `protocol`.
