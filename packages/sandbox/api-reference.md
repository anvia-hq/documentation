# `@anvia/sandbox` API reference

All public runtime symbols are exported from `@anvia/sandbox`. Remote and daemon pieces are subpath exports, so Docker-only applications do not load `ws`.

## Client and lifecycle

```ts
class DockerSandboxClient {
  constructor(options?: { dockerPath?: string })
  pullImage(options: PullDockerImageOptions): Promise<void>
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

Images and named volumes must already exist. `pullImage()` is the explicit image acquisition operation.

## Neutral runtime

`SandboxRuntime` is the provider-neutral contract used by `createSandboxTools()`:

```ts
interface SandboxRuntime {
  readonly id: string
  readonly provider: string
  readonly workdir: string
  readonly publishedPorts: readonly SandboxPublishedPort[]

  exec(options: SandboxExecOptions): Promise<SandboxExecResult>
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
function createDockerSandboxTools(
  options: CreateDockerSandboxToolsOptions,
): readonly import('@anvia/core/tool').AnyTool[]
```

`options.tools` is a required, ordered, non-empty tuple of `DockerSandboxToolName`. Supported names are command, file, port, and process operations. The policy families are `DockerSandboxExecToolPolicy`, `DockerSandboxReadFileToolPolicy`, `DockerSandboxFileToolPolicy`, and `DockerSandboxProcessToolPolicy`.

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

It uses the neutral option and policy types `CreateSandboxToolsOptions`, `SandboxToolName`, `SandboxCommandPolicy`, `SandboxExecToolPolicy`, `SandboxReadFileToolPolicy`, `SandboxFileToolPolicy`, and `SandboxProcessToolPolicy`. `createDockerSandboxTools()` is a wrapper around it. Both forward `ToolCallContext.operationId` to mutating runtime calls.

### Desktop tools

```ts
function createDesktopTools(
  options: CreateDesktopToolsOptions,
): readonly import('@anvia/core/tool').AnyTool[]

const desktopToolRecovery: Readonly<Record<DesktopToolName, 'safe' | 'idempotent'>>
```

`options.sandbox` is a `SandboxDesktop` such as `hub.desktop(id)`. `tools` defaults to all nine names: `desktop_screenshot`, `desktop_click`, `desktop_mouse_move`, `desktop_drag`, `desktop_scroll`, `desktop_type`, `desktop_key`, `desktop_cursor_position`, and `desktop_wait`. `settleMs` (300 by default) delays input tools so the application can react; `screenshot: { maxEdge, maxPixels }` changes the image limits.

`desktopToolRecovery` is the table to spread into a durable registration's `toolRecovery`: screenshots, the cursor position, and waiting are `safe`; every input is `idempotent`.

## Remote runtime

Remote exports come from `@anvia/sandbox/remote`:

```ts
class RemoteSandboxHub {
  constructor(options: RemoteSandboxHubOptions)
  runtime(sandboxId: string, options?: { workdir?: string }): SandboxRuntime
  terminal(sandboxId: string): SandboxTerminal
  tunnel(sandboxId: string): SandboxTunnel
  desktop(sandboxId: string): SandboxDesktop
  connected(): string[]
  isConnected(sandboxId: string): boolean
  forget(sandboxId: string): void
  listen(options?: RemoteSandboxHubListenOptions): Promise<{ port: number }>
  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void
  handleTerminalUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void
  handleTunnelUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void
  handleDesktopUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void
  close(): Promise<void>
}
```

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
| `terminalSubprotocol`, `tunnelSubprotocol`, `desktopSubprotocol` | Subprotocol names the relays select. |

Studio registration helpers:

```ts
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

`studioSandbox()` returns a read-only inspector for files, processes, and logs plus a live desktop view. `StudioSandboxOptions` contains `agentIds`, `toolNames`, `workdir`, and `desktop` (`false` to omit the view, or `{ id, label }`). The view is registered with local access and no authentication.

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
}
```

`SandboxDaemonOptions` requires `controlUrl`, `token`, `workdir`, and `stateDir`. Optional fields are `limits`, `terminal`, `tunnel`, `desktop`, `env`, `maxOperations`, `maxStoredResultBytes`, `reconnect`, `handshakeTimeoutMs`, `binaryData`, `maxPayloadBytes`, `version`, and `onLog`. The related types are `SandboxDaemonTerminalOptions`, `SandboxDaemonTunnelOptions`, `SandboxDaemonDesktopOptions`, and `SandboxDaemonLogLevel`; the terminal PTY extension points are `PtySpawner`, `PtySpawnOptions`, and `PtyProcess`.

The `anvia-sandbox-daemon` executable reads the same required values from `ANVIA_CONTROL_URL` and `ANVIA_SANDBOX_TOKEN`, with `ANVIA_SANDBOX_WORKDIR` and `ANVIA_SANDBOX_STATE_DIR` for local paths.

## Errors

`DockerSandboxError` exposes a `code` and optional `details`. `DockerSandboxErrorCode` includes Docker availability and command failures, missing images or volumes, missing or invalid sandbox state, invalid paths, timeouts, oversized files, tool-policy failures, ports, and processes. Remote links add `sandbox_unavailable`, `unsupported`, `desktop_locked`, and `protocol`.
