# `@anvia/sandbox` API reference

All public runtime symbols are exported from `@anvia/sandbox`.

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

## Runtime

`DockerSandboxRuntime` exposes:

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

## Errors

`DockerSandboxError` exposes a `code` and optional `details`. `DockerSandboxErrorCode` includes Docker availability and command failures, missing images or volumes, missing or invalid sandbox state, invalid paths, timeouts, oversized files, tool-policy failures, ports, and processes.
