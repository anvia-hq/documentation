# `@anvia/sandbox` API reference

All public runtime symbols are exported from `@anvia/sandbox`.

## `DockerSandbox`

```ts
class DockerSandbox implements Sandbox {
  readonly provider: 'docker'
  constructor(options?: DockerSandboxOptions)
  static node(options?: DockerSandboxOptions): DockerSandbox
  static python(options?: DockerSandboxOptions): DockerSandbox
  static deno(options?: DockerSandboxOptions): DockerSandbox
  createSession(options?: DockerSandboxCreateSessionOptions): Promise<DockerSandboxSession>
}
```

```ts
interface DockerSandboxOptions {
  image?: string
  pull?: 'missing' | 'always' | 'never'
  workdir?: string
  workspace?: SandboxWorkspaceOptions
  lifecycle?: SandboxLifecycleOptions
  network?: SandboxNetworkMode | DockerSandboxNetworkOptions
  user?: string
  dockerPath?: string
  labels?: Record<string, string>
  limits?: SandboxLimits
  security?: DockerSandboxSecurityOptions
  hooks?: SandboxHooks
}
```

`DockerSandboxCreateSessionOptions` extends the common session options with a `ports` array.

## Session contracts

```ts
interface Sandbox {
  readonly provider: string
  createSession(options?: SandboxCreateSessionOptions): Promise<SandboxSession>
}

interface SandboxSession {
  readonly id: string
  readonly provider: string
  readonly workdir: string
  exec(options: SandboxExecOptions): Promise<SandboxExecResult>
  execStream(options: SandboxExecOptions): AsyncIterable<SandboxExecStreamEvent>
  readFile(path: string): Promise<Uint8Array>
  readTextFile(path: string): Promise<string>
  readTextFilePage?(path: string, options?: SandboxTextFileReadOptions): Promise<SandboxTextFileReadResult>
  writeFile(path: string, data: string | Uint8Array): Promise<void>
  writeTextFile(path: string, content: string): Promise<void>
  listFiles(path?: string): Promise<SandboxFileEntry[]>
  destroy(): Promise<void>
}
```

`SandboxPortSession` adds `publishedPorts` and `waitForPort()`. `SandboxProcessSession` adds process start, list, log, and stop operations. `DockerSandboxSession` implements both.

Use the runtime guards when working through the generic interface:

```ts
function isSandboxPortSession(session: SandboxSession): session is SandboxPortSession
function isSandboxProcessSession(session: SandboxSession): session is SandboxProcessSession
```

## Commands and files

`SandboxExecOptions` configures command, arguments, working directory, environment, timeout, stdin, abort signal, and output callbacks. `SandboxExecResult` reports stdout, stderr, exit code, duration, timeout/abort state, and truncation flags. `SandboxExecStreamEvent` yields stdout, stderr, and final exit events.

File APIs use `SandboxFileEntry`, `SandboxFileType`, `SandboxTextFileReadOptions`, and `SandboxTextFileReadResult`. The paged text result reports line bounds and whether a line or byte limit truncated the response.

## Processes and ports

| Area | Public types |
| --- | --- |
| Ports | `SandboxPublishedPort`, `SandboxWaitForPortOptions`, `SandboxPortSession`, `DockerSandboxNetworkOptions`, `SandboxNetworkMode` |
| Processes | `SandboxProcessSession`, `SandboxProcessStartOptions`, `SandboxProcessInfo`, `SandboxProcessStatus`, `SandboxProcessLogs`, `SandboxProcessLogsOptions`, `SandboxProcessStopOptions` |

Published ports bind to `127.0.0.1` and report the container and assigned host ports.

## Agent tools

```ts
function createSandboxTools(
  session: SandboxSession,
  options?: SandboxToolsOptions,
): import('@anvia/core/tool').AnyTool[]

type SandboxToolsFactory = (
  session: SandboxSession,
  options?: SandboxToolsOptions,
) => AnyTool[]
```

`SandboxToolsOptions` selects tools with `allow` or `include` and applies execution, read-file, write-file, and process policies. `SandboxToolName` includes command, file, port, and process operations. Policy types are `SandboxExecToolPolicy`, `SandboxReadFileToolPolicy`, `SandboxFileToolPolicy`, and `SandboxProcessToolPolicy`.

## Isolation and lifecycle types

- `SandboxManifest` seeds files, directories, and environment values.
- `SandboxWorkspaceOptions` selects ephemeral or named persistent workspaces.
- `SandboxLifecycleOptions` controls TTL, idle timeout, and automatic destruction.
- `SandboxLimits` controls execution time, output/file sizes, memory, CPU, PIDs, and process count.
- `DockerSandboxSecurityOptions` controls read-only root filesystems, no-new-privileges, and dropped capabilities.
- `SandboxHooks` observes session creation, execution, file writes, and destruction through `SandboxSessionEvent`, `SandboxExecEvent`, `SandboxExecEndEvent`, and `SandboxFileWriteEvent`.

## Errors

All specific errors extend `SandboxError`:

| Error | Meaning |
| --- | --- |
| `SandboxDockerUnavailableError` | Docker cannot be invoked. |
| `SandboxDockerCommandError` | A Docker command failed; exposes stdout, stderr, and exit code. |
| `SandboxSessionDestroyedError` | An operation targeted a destroyed session. |
| `SandboxPathError` | A requested path violates workspace rules. |
| `SandboxTimeoutError` | An operation exceeded its deadline. |
| `SandboxFileSizeError` | File policy rejected the requested size. |
| `SandboxToolPolicyError` | A generated agent tool violated policy. |
| `SandboxPortError` | Port publication or readiness failed. |
| `SandboxProcessError` | A managed-process operation failed. |

