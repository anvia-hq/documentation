# Sandboxes

Studio inspects the sandboxes your agents use: a read-only view of files, processes, and logs, plus a remote sandbox's live desktop that a person can watch and take over. Use it to answer, “What is in the workspace, what is running, and what did it print?” while developing an agent.

Open `http://localhost:4021/sandboxes`. The compatibility path `http://localhost:4021/ui/sandboxes` redirects to the same page with the default UI configuration.

![Studio sandbox inspector showing files, a published port, and a managed process](/images/studio/sandbox-inspector.png)

## Discover sandboxes from agent tools

Studio 1.6.0 and `@anvia/sandbox` 1.5.0 find sandboxes automatically. Give an agent tools from `sandboxToolkit`, `desktopToolkit`, `createSandboxTools`, `createDockerSandboxTools`, or `createDesktopTools`, then pass the agent to Studio without a `sandboxes` option:

```ts
import { Agent } from '@anvia/core/agent'
import { DockerSandboxClient, sandboxToolkit } from '@anvia/sandbox'
import { Studio } from '@anvia/studio'

const client = new DockerSandboxClient()
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  pull: 'if-missing',
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

const agent = new Agent({
  id: 'sandbox-builder',
  model,
  tools: [
    sandboxToolkit({
      sandbox,
      include: [
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
    }),
  ],
})

const studio = new Studio([agent])
```

Each sandbox tool carries discovery metadata. Studio scans every registered agent's `tools`, including tools inside toolkits, and groups them by sandbox provider and ID. A discovered sandbox lists the agents that hold its tools and the tool names as the agent sees them, so a toolkit `prefix` appears in the name. Desktop tools add their live desktop view to the same entry.

Discovery has these limits:

- Studio sees only an agent's `tools`. Sandbox tools reached through a tool index are not discovered; register those sandboxes explicitly.
- Discovered inspection exposes files, published ports, and processes by default. Set `studio: { files, ports, processes }` on the toolkit or tool factory to narrow it. At least one must stay enabled.
- `studio: false` on the toolkit or tool factory omits the metadata for those tools.
- `autoDiscoverSandboxes: false` on `new Studio(agents, options)` turns discovery off for the whole Studio instance.

## Register a sandbox explicitly

Register a sandbox yourself when its tools are not on an agent's `tools`, when Studio should show it to different agents or tools, or when discovery is off. `studioSandbox` builds the registration for a local `DockerSandbox` or any `SandboxRuntime`:

```ts
import { studioSandbox } from '@anvia/sandbox'
import { Studio } from '@anvia/studio'

const studio = new Studio([agent], {
  sandboxes: [
    studioSandbox(sandbox, {
      agentIds: ['sandbox-builder'],
      files: true,
      ports: false,
      processes: true,
    }),
  ],
})
```

`files`, `ports`, and `processes` default to `true`. You can also pass a raw registration object, such as `{ inspector: sandbox.inspector({ files: true, processes: true }), agentIds, toolNames }`.

At least one inspector capability or view must be enabled. File inspection requires both listing and reading; process inspection requires both listing and log reading. `agentIds` must reference registered agents.

When an explicit registration and a discovered sandbox share a provider and ID, Studio merges them:

| Field | Result |
| --- | --- |
| `inspector` | Always the explicit one. |
| `agentIds`, `toolNames` | The explicit list replaces the discovered list when set; otherwise the discovered list is kept. |
| `views` | The explicit list replaces discovered views when set; `views: []` removes them. |
| `dispose` | The explicit cleanup when set; otherwise the discovered one. |

Two explicit registrations with the same provider and ID are rejected.

## What you can inspect

| Surface | What Studio shows |
| --- | --- |
| **Files** | One directory level at a time, with breadcrumbs, entry type, and size. |
| **File preview** | UTF-8 text and common image formats, plus a download action. |
| **Published ports** | Container port and protocol mapped to the provider's host and host port. |
| **Managed processes** | Command, arguments, state, and bounded stdout and stderr. |
| **Registered views** | Authorized noVNC desktop views, including a remote sandbox's live desktop. |

Studio previews recognized text and image files up to 1 MiB. Other binary files and larger previews are downloads. The runtime refuses file responses larger than 10 MiB, requires relative paths, rejects traversal, disables caching, and bounds process-log reads.

Register a desktop view through the sandbox registration's `views` array, or let desktop tools register it; see [Inspect a remote sandbox](#inspect-a-remote-sandbox).

## Inspect a remote sandbox

Desktop tools from `desktopToolkit` or `createDesktopTools` carry a live desktop view, so an agent that uses them appears in Studio with that view and no extra registration. To also browse the remote sandbox's files, processes, and logs, either give the agent `sandboxToolkit({ sandbox: hub.runtime('sbx_123') })` or register `studioSandbox(hub, sandboxId)`, which builds the inspector and the desktop view together:

```ts anvia-check
import { desktopToolkit, studioSandbox } from '@anvia/sandbox'
import { RemoteSandboxHub } from '@anvia/sandbox/remote'
import { Studio } from '@anvia/studio'
import { Agent } from '@anvia/core/agent'

declare const model: import('@anvia/core').CompletionModel

const hub = new RemoteSandboxHub({
  authorize: (token) => (token === 'local-dev-token' ? { sandboxId: 'sbx_123' } : null),
})

const agent = new Agent({
  id: 'desktop-agent',
  model,
  tools: [desktopToolkit({ sandbox: hub.desktop('sbx_123') })],
})

const studio = new Studio([agent], {
  sandboxes: [studioSandbox(hub, 'sbx_123')],
})
```

The explicit registration and the discovered desktop share the provider and ID `remote/sbx_123`, so Studio merges them: the agent and desktop tool names come from discovery, and the inspector comes from `studioSandbox`. `studioSandbox` and `studioDesktopView` are exported from both `@anvia/sandbox` and `@anvia/sandbox/remote`.

Studio and the hub must run in the same process, because the desktop is streamed through the hub's own link. The hub still authorizes and routes the daemon connection; `studioSandbox` only turns an already connected sandbox into a Studio registration.

Pass `desktop: false` to register the inspector alone, or `desktop: { id, label }` to name the view. `studioDesktopView(hub.desktop('sbx_123'))` returns just the view. Desktop tools take `studio: { id, label }` to name their discovered view, or `studio: false` to omit it.

The desktop panel is view-only until a person explicitly takes control. A viewer watches the live display and can type and click only while it holds control. While they hold it, their input reaches the desktop and the agent's desktop tools fail with `desktop_locked` until they release control or stop renewing. The lease is renewed by the UI and expires when abandoned. Closing the panel does not forget the desktop; use the **Browser** button beside the composer to show it again.

The view is registered with local access and no authentication, so keep Studio on localhost or put your own access control in front of it. See [Remote desktop](/sdk/advanced/sandbox/desktop) for the desktop API, tools, and image requirements.

## Inspector actions versus agent tools

The read-only inspector cannot write files, execute commands, start or stop processes, or destroy a sandbox. A remote desktop view can send input only while a person holds control, which also pauses the agent's desktop tools. The agent tools can do only what their explicit tool tuple and policies allow.

## Own the lifecycle

By default, Studio does not own or destroy a sandbox, whether discovered or registered. Destroy it in your own shutdown code:

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

To hand a local Docker sandbox's cleanup to Studio instead, set `disposeOnShutdown: true` on `studioSandbox(sandbox, options)` or in the toolkit's `studio` option:

```ts
sandboxToolkit({ sandbox, studio: { disposeOnShutdown: true } })
```

Studio then calls `sandbox.destroy()` from `studio.shutdown()`, after in-flight runs drain, and each cleanup runs once. `studio.serve(...)` calls `shutdown()` when it stops, before `onShutdown`. `studio.close()` does not dispose sandboxes. `disposeOnShutdown` requires a `DockerSandbox` handle and throws for a bare `SandboxRuntime`; remote sandboxes are never disposed by Studio. A raw registration can supply its own `dispose` function.

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
