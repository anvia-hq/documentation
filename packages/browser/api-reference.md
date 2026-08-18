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
  waitUntilReady(options: BrowserWaitUntilReadyOptions): Promise<void>
  connect(options?: BrowserConnectOptions): Promise<PlaywrightBrowserConnection>
  stop(options?: { abortSignal?: AbortSignal }): Promise<void>
  destroy(): Promise<void>
}
```

`DockerBrowser` is a handle returned by the client, not a constructable class.

## Connection and tools

```ts
interface PlaywrightBrowserConnection extends AsyncDisposable {
  readonly closed: boolean
  listTabs(): Promise<readonly BrowserTab[]>
  disconnect(): Promise<void>
}

function createBrowserTools(options: CreateBrowserToolsOptions): readonly AnyTool[]
```

`CreateBrowserToolsOptions.tools` is a required non-empty tuple of `BrowserToolName`. Navigation is either `{ mode: 'allow-all-http' }` or `{ mode: 'origins', origins }`. Optional limits control action timeout, navigation timeout, and maximum snapshot characters.

## Desktop control

`BrowserDesktopEndpoint` exposes the noVNC container port and a `BrowserControl`. Acquire human control with an owner ID and lease timeout, renew the returned `BrowserHumanControlLease`, and release or dispose it when control returns to the agent.

## Errors

`BrowserError` exposes a `BrowserErrorCode` covering closed connections, missing or unknown tabs, readiness failures, invalid navigation, human-control conflicts, and browser image/runtime problems.
