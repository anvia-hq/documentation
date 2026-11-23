# Sandboxes

Studio inspects explicitly registered sandboxes: a read-only view of files, processes, and logs, plus a remote sandbox's live desktop that a person can watch and take over. Use it to answer, “What is in the workspace, what is running, and what did it print?” while developing an agent.

Open `http://localhost:4021/sandboxes`. The compatibility path `http://localhost:4021/ui/sandboxes` redirects to the same page with the default UI configuration.

![Studio sandbox inspector showing files, a published port, and a managed process](/images/studio/sandbox-inspector.png)

## Register an inspector

Studio does not discover sandboxes from agent tools. Create a sandbox, choose the read capabilities to expose, and register the inspector explicitly:

```ts
import { Agent } from '@anvia/core/agent'
import {
  DockerSandboxClient,
  createDockerSandboxTools,
} from '@anvia/sandbox'
import { Studio } from '@anvia/studio'

const client = new DockerSandboxClient()
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'bridge', ports: [3000] },
  files: {
    'README.md': '# Sandbox workspace',
    'server.js': 'console.log("ready")',
  },
  runtime: {
    commandTimeoutMs: 30_000,
    maxOutputBytes: 128_000,
    maxFileBytes: 1024 * 1024,
    maxProcesses: 4,
  },
})

const tools = createDockerSandboxTools({
  sandbox: sandbox.runtime,
  tools: [
    'exec_command', 'read_file', 'write_file', 'list_files',
    'list_ports', 'list_processes', 'read_process_logs',
  ],
  exec: {
    commands: { mode: 'allow', values: ['node'] },
    maxTimeoutMs: 30_000,
  },
  readFile: { maxBytes: 128_000 },
  writeFile: { maxBytes: 128_000 },
  process: { maxLogBytes: 64_000 },
})

const agent = new Agent({
  id: 'sandbox-builder',
  model,
  tools: [...tools],
})

const studio = new Studio([agent], {
  sandboxes: [{
    inspector: sandbox.inspector({ files: true, ports: true, processes: true }),
    agentIds: ['sandbox-builder'],
    toolNames: tools.map((tool) => tool.name),
  }],
})
```

At least one inspector capability must be enabled. File inspection requires both listing and reading; process inspection requires both listing and log reading. `agentIds` must reference registered agents. Duplicate provider/ID registrations are rejected.

## What you can inspect

| Surface | What Studio shows |
| --- | --- |
| **Files** | One directory level at a time, with breadcrumbs, entry type, and size. |
| **File preview** | UTF-8 text and common image formats, plus a download action. |
| **Published ports** | Container port and protocol mapped to the provider's host and host port. |
| **Managed processes** | Command, arguments, state, and bounded stdout and stderr. |
| **Registered views** | Authorized noVNC desktop views, including a remote sandbox's live desktop. |

Studio previews recognized text and image files up to 1 MiB. Other binary files and larger previews are downloads. The runtime refuses file responses larger than 10 MiB, requires relative paths, rejects traversal, disables caching, and bounds process-log reads.

Register a desktop view through the sandbox registration's `views` array. A remote sandbox registers its desktop with `studioSandbox`; see [Inspect a remote sandbox](#inspect-a-remote-sandbox).

## Inspect a remote sandbox

`studioSandbox` from `@anvia/sandbox/remote` builds the registration for a sandbox connected to a `RemoteSandboxHub`: a read-only inspector for files, processes, and logs, plus a live desktop view.

```ts anvia-check
import { createDesktopTools } from '@anvia/sandbox'
import { RemoteSandboxHub, studioSandbox } from '@anvia/sandbox/remote'
import { Studio } from '@anvia/studio'

declare const agent: import('@anvia/core/agent').Agent

const hub = new RemoteSandboxHub({
  authorize: (token) => (token === 'local-dev-token' ? { sandboxId: 'sbx_123' } : null),
})
const tools = createDesktopTools({ sandbox: hub.desktop('sbx_123') })

const studio = new Studio([agent], {
  sandboxes: [
    studioSandbox(hub, 'sbx_123', {
      agentIds: [agent.id],
      toolNames: tools.map((tool) => tool.name),
    }),
  ],
})
```

Studio and the hub must run in the same process, because the desktop is streamed through the hub's own link. The hub still authorizes and routes the daemon connection; `studioSandbox` only turns an already connected sandbox into a Studio registration.

Pass `desktop: false` to register the inspector alone, or `desktop: { id, label }` to name the view. `studioDesktopView(hub.desktop('sbx_123'))` returns just the view.

The desktop panel is view-only until a person explicitly takes control. A viewer watches the live display and can type and click only while it holds control. While they hold it, their input reaches the desktop and the agent's desktop tools fail with `desktop_locked` until they release control or stop renewing. The lease is renewed by the UI and expires when abandoned. Closing the panel does not forget the desktop; use the **Browser** button beside the composer to show it again.

The view is registered with local access and no authentication, so keep Studio on localhost or put your own access control in front of it. See [Remote desktop](/sdk/advanced/sandbox/desktop) for the desktop API, tools, and image requirements.

## Inspector actions versus agent tools

The read-only inspector cannot write files, execute commands, start or stop processes, or destroy a sandbox. A remote desktop view can send input only while a person holds control, which also pauses the agent's desktop tools. The agent tools can do only what their explicit tool tuple and policies allow.

## Own the lifecycle

Studio never owns or destroys a registered sandbox:

```ts
try {
  await studio.serve({
    hostname: '127.0.0.1',
    port: 4021,
    onShutdown: async () => {
      await sandbox.destroy()
    },
  })
} catch (error) {
  await sandbox.destroy().catch(() => undefined)
  throw error
}
```

Studio is a development inspector, not a hosted sandbox control plane. Protect the Studio origin and treat file previews, process logs, and port addresses as sensitive.

For a remote sandbox, application lifecycle code owns the daemon and sandbox. Call `hub.forget('sbx_123')` after destroying one so the hub does not keep its runtime entry or connection.

## Read-only API

```text
GET /sandboxes
GET /sandboxes/:sandboxRef
GET /sandboxes/:sandboxRef/files?path=.
GET /sandboxes/:sandboxRef/files/content?path=README.md
GET /sandboxes/:sandboxRef/ports
GET /sandboxes/:sandboxRef/processes
GET /sandboxes/:sandboxRef/processes/:processId/logs?tailBytes=65536
```

Use the opaque `ref` returned by `GET /sandboxes`.
