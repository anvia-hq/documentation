# Remote sandboxes

The remote runtime separates the control plane from the workload. The control plane runs the agent and its tools; a daemon inside each sandbox connects out over a WebSocket, executes operations locally, and owns process state and logs. Restarting the control plane reconnects the daemons, while the processes they started keep running.

`RemoteSandboxHub` authorizes and routes those connections. It does not create, stop, or destroy sandboxes, and it does not issue tokens.

## When to use it

Use the Docker runtime when the agent and the container share a host and the application can drive the local `docker` CLI. Use the remote runtime when the workload runs on another machine, in a managed container, or anywhere the control plane cannot reach inbound. The sandbox is the machine the daemon runs on; isolation, resource limits, and network policy come from that surrounding infrastructure, not from the hub.

## The neutral runtime contract

Both backends implement `SandboxRuntime`. The interface identifies its implementation with `provider: string` and exposes commands, files, processes, and port readiness. `createSandboxTools()` builds the same agent tools for any implementation; `createDockerSandboxTools()` is a wrapper around it.

```ts
import { createSandboxTools, type SandboxRuntime } from '@anvia/sandbox'

function toolsFor(sandbox: SandboxRuntime) {
  return createSandboxTools({
    sandbox,
    tools: ['list_files', 'read_file', 'exec_command'],
    exec: { commands: { mode: 'allow', values: ['node'] } },
  })
}
```

`DockerSandboxRuntime` reports `provider: 'docker'` and narrows `waitForPort()` to a `SandboxPublishedPort` with a host and host port. The remote runtime reports `provider: 'remote'`, always reports an empty `publishedPorts` list, and returns a `SandboxPortStatus` without a host endpoint.

## Control plane

Create one hub per control-plane process. `authorize` receives the daemon's bearer token once per connection attempt, before the WebSocket upgrade completes. Return the sandbox id the token belongs to, or `null` to refuse it with HTTP 401.

```ts
import { createSandboxTools } from '@anvia/sandbox'
import { RemoteSandboxHub } from '@anvia/sandbox/remote'

// Application-owned token store. The example keeps one token in memory.
const daemonTokens = new Map([[process.env.DAEMON_TOKEN!, 'sandbox-1']])

const hub = new RemoteSandboxHub({
  authorize: (token) => {
    const sandboxId = daemonTokens.get(token)
    return sandboxId === undefined ? null : { sandboxId }
  },
  connectTimeoutMs: 30_000,
})

await hub.listen({ port: 8787, path: '/daemon' })

// Usable before the daemon has connected. Calls wait for it up to connectTimeoutMs.
const sandbox = hub.runtime('sandbox-1', { workdir: '/workspace' })
const tools = createSandboxTools({
  sandbox,
  tools: ['exec_command', 'read_file', 'write_file', 'list_files'],
})
```

`hub.runtime(id)` returns the same runtime object for the same id. Its `workdir` is the daemon's reported workdir once connected, otherwise the `workdir` passed to `runtime()`, otherwise `/workspace`.

`hub.listen()` is a convenience HTTP listener for deployments that have no server of their own. To attach the hub to an existing server, route its `upgrade` event:

```ts
server.on('upgrade', (request, socket, head) => {
  const path = new URL(request.url ?? '/', 'http://hub').pathname
  if (path === '/daemon') hub.handleUpgrade(request, socket, head)
  else socket.destroy()
})
```

The daemon sends its token as an `Authorization: Bearer` header. The hub calls `authorize` before the upgrade, so a missing or refused token gets HTTP 401 and an authorizer exception gets HTTP 500. Use `wss://` outside loopback: the token is sent in clear text over `ws://`.

### Token model

The token is a daemon credential, not a user session or a sandbox capability. The application issues it, stores only what it needs to resolve it, rotates it, and revokes it when the sandbox is destroyed. Your `authorize` callback must resolve a token to exactly one sandbox id. Tenant isolation, ownership checks, and the decision to start a sandbox at all remain application responsibilities.

## Run the daemon

Start the daemon however your infrastructure starts workloads. It needs only an outbound connection.

```sh
ANVIA_CONTROL_URL=wss://agents.example.com/daemon \
ANVIA_SANDBOX_TOKEN="$SANDBOX_DAEMON_TOKEN" \
ANVIA_SANDBOX_WORKDIR=/workspace \
npm exec --package=@anvia/sandbox -- anvia-sandbox-daemon
```

| Variable | Purpose |
| --- | --- |
| `ANVIA_CONTROL_URL` | Required. `ws://` or `wss://` hub endpoint. |
| `ANVIA_SANDBOX_TOKEN` | Required. Credential presented to `authorize`. |
| `ANVIA_SANDBOX_WORKDIR` | Workspace directory. Defaults to the current directory. |
| `ANVIA_SANDBOX_STATE_DIR` | Operation deduplication table. Defaults to a directory under the OS temporary directory. |
| `ANVIA_SANDBOX_COMMAND_TIMEOUT_MS` | Default command timeout. |
| `ANVIA_SANDBOX_MAX_OUTPUT_BYTES` | Maximum buffered command output. |
| `ANVIA_SANDBOX_MAX_FILE_BYTES` | Maximum file size for reads and writes. |
| `ANVIA_SANDBOX_MAX_PROCESSES` | Maximum managed processes. |

The daemon removes `ANVIA_SANDBOX_TOKEN` and `ANVIA_CONTROL_URL` from the environment of every command and process it runs, so agent-run code cannot read its own credentials. Keep `ANVIA_SANDBOX_STATE_DIR` outside the workdir and somewhere private: stored operation results can include command output.

To embed the daemon in your own process, use `SandboxDaemon` from `@anvia/sandbox/daemon`:

```ts
import { SandboxDaemon } from '@anvia/sandbox/daemon'

const daemon = new SandboxDaemon({
  controlUrl: process.env.ANVIA_CONTROL_URL!,
  token: process.env.ANVIA_SANDBOX_TOKEN!,
  workdir: '/workspace',
  stateDir: '/var/lib/anvia-sandbox',
})

daemon.start()
await daemon.ready()
```

`start()` begins connecting; `ready()` resolves after the first handshake. `stop()` closes the link and disposes the daemon's local state. The daemon runs on POSIX hosts only.

## Hub state and lifecycle

- `hub.connected()` returns the ids of sandboxes whose daemons are connected now.
- `hub.isConnected(id)` reports one sandbox.
- `hub.forget(id)` drops the hub's record for a sandbox and disconnects its daemon. Call it when your lifecycle code destroys the sandbox so a long-lived hub does not accumulate one entry per sandbox.
- A runtime object you still hold after `forget()` keeps working if the daemon connects again.
- `hub.close()` stops accepting daemons and closes relays and existing links. Daemons reconnect when the hub returns.

There is no create, stop, or destroy method on the hub. The application owns sandbox provisioning, image selection, tokens, teardown, and reconciliation of workloads that outlive a control-plane crash.

## Calls while disconnected

A call made while the daemon is disconnected waits for a connection on each attempt; if none arrives within `connectTimeoutMs`, that attempt fails with `sandbox_unavailable`. If the link drops during a call:

| Call | Behavior |
| --- | --- |
| `readFile`, `listFiles`, `readProcessLogs`, `listProcesses`, `waitForPort` | Retried after the daemon reconnects. |
| `exec`, `execStream`, `writeFile`, `writeTextFile`, `startProcess`, `stopProcess` with an `operationId` | Retried after reconnect; the daemon deduplicates the id. |
| Any mutating call without an `operationId` | Fails with `sandbox_unavailable`, because it may already have run. |

Retries wait for a reconnect and make at most three attempts. Reconnects use exponential backoff with jitter. Daemons keep running processes, logs, and the operation table across disconnects. If a second daemon connects for the same sandbox id, it replaces the first; the displaced daemon stops reconnecting rather than evicting its replacement.

A request carrying an `operationId` keeps running on the daemon after the link drops, and its result waits for the retry. Other in-flight requests are aborted because no one remains to receive the answer.

## Idempotent operations

`exec`, `execStream`, `writeFile`, `writeTextFile`, `startProcess`, and `stopProcess` accept an optional `operationId`. The daemon runs each id once. A retry that arrives while the first attempt is running joins it; a later retry gets the stored result.

Only successful results are stored, so a failed or cancelled attempt can be retried for real. Reusing an id with different parameters fails with `invalid_state`. Without `@anvia/durable`, pass your own stable `operationId` to the runtime methods.

`createSandboxTools()` forwards `ToolCallContext.operationId`, which lets a durable run's stable operation key reach the daemon. The mutating tools can then be marked `idempotent` in the durable registration:

```ts
toolRecovery: {
  exec_command: 'idempotent',
  write_file: 'idempotent',
  start_process: 'idempotent',
  stop_process: 'idempotent',
},
```

The operation table is bounded to 256 entries by default; the oldest entry is evicted first. Deduplication therefore covers recent operations, not all history. An evicted operation runs again if retried.

Limits and exceptions:

- `execStream` deduplicates the final result only. A duplicate does not replay output events.
- A daemon that loses its state directory loses its history.
- `startProcess` and `stopProcess` results are kept in daemon memory only, because process state does not survive a daemon restart. They deduplicate across reconnects and hub restarts, but a retry after the daemon itself restarted runs again.
- Results larger than `maxStoredResultBytes` (256 KiB by default) are marked as dropped. A retry fails with `invalid_state` instead of running the operation a second time.

## Differences from the Docker runtime

Remote and Docker share a conformance suite, so file, exec, process, path-safety, and limit behavior match. Known differences:

| Area | Remote runtime |
| --- | --- |
| Ports | `publishedPorts` is always empty and there is no host address. `waitForPort()` resolves once something accepts TCP on the sandbox's loopback and returns `{ containerPort, protocol: 'tcp' }`; `host` and `hostPort` are absent. The `wait_for_port` tool's corresponding output fields are optional. |
| Exit codes | A missing command is exit code 127. A missing working directory is exit code 126. Neither is thrown as an error. A missing file fails with `invalid_path`. |
| Paths | Checks use the real path. Reading or listing through a symlink that resolves outside the workdir is rejected, and a write is rejected if any destination component is a symlink, including a dangling one. These checks are best-effort against a concurrently running process. |
| Privileges | Commands run on the daemon's host with the daemon's privileges. Isolation, resource limits, and network policy are whatever the surrounding sandbox provides. |
| Platform | The daemon supports POSIX hosts only. |
| Files | Each file moves in one base64-encoded frame, so it is bounded by `maxFileBytes` (10 MiB by default) and by the hub's `maxPayloadBytes` (64 MiB by default). |
| Workdir | The runtime reports the daemon's workdir once connected; before that it uses the `workdir` passed to `hub.runtime()`. |

## Protocol and capabilities

One WebSocket carries versioned JSON frames, validated with zod on both ends. The daemon opens with `hello` (protocol version, workdir, capabilities) and the hub answers `welcome`; a version mismatch closes the socket with code 1002. Requests correlate by `requestId`, and `execStream` output arrives as ordered `stream` frames. Aborting a call sends `cancel`, which kills the command's process group. Both sides send application-level pings and drop a peer that is silent for three intervals.

Optional features are negotiated instead of versioned. `hello` and `welcome` carry an optional `capabilities` list:

| Capability | Meaning |
| --- | --- |
| `terminal` | Interactive terminals. |
| `terminal.tmux` | Terminal sessions persist in tmux. |
| `tunnel` | Loopback TCP tunnels. |
| `desktop` | Virtual display, input, control lock, and VNC. |
| `binary-data` | Tunnel bytes may travel as binary WebSocket messages. |

A peer that predates a feature sends no capabilities, and zod ignores unknown fields, so mixed hub and daemon versions keep working. A feature the daemon did not advertise fails with the `unsupported` error code, and the rest of the link keeps working. `PROTOCOL_VERSION` changes only when an existing frame changes meaning.

When both peers list `binary-data`, tunnel bytes travel as binary messages; otherwise they stay base64 inside JSON. Acknowledgements, terminal output, open, and close frames keep their existing formats. Set `binaryData: false` on the hub or daemon if something between them mishandles binary messages.

## Security and operations

- Treat the daemon token as a secret. Do not log it, put it in a URL, or reuse it across sandboxes.
- Use `wss://` and terminate TLS at a trusted proxy. The hub does not provide transport security.
- Authorize every sandbox start, daemon token, browser ticket, and tenant access in application code.
- Keep the operation state directory private and outside the workdir. It can contain command output and file contents.
- The daemon runs with its own host privileges. Use a dedicated user, container, VM, or stronger isolation boundary for untrusted code, and apply egress policy outside the hub.
- The hub registry is in memory. Run one hub per control-plane process; multi-node routing is not included.
- Studio desktop views are registered with local access and no authentication. Keep Studio on localhost or behind your own access control.

Continue with [remote terminals](/sdk/advanced/sandbox/terminals), [tunnels](/sdk/advanced/sandbox/tunnels), and the [package API reference](/packages/sandbox/api-reference).