# Sandboxes

Studio discovers live sandbox sessions attached to an agent's sandbox tools and gives you a read-only view of their workspace and runtime state. Use it to answer, “What is in the workspace, what is running, and what did it print?” while developing an agent.

Open `http://localhost:4021/sandboxes`. The compatibility path `http://localhost:4021/ui/sandboxes` redirects to the same page with the default UI configuration.

![Studio sandbox inspector showing files, a published port, and a managed process](/images/studio/sandbox-inspector.png)

## Register a live sandbox

Studio does not create a sandbox from configuration alone. Create the session, turn it into tools with `createSandboxTools(session)`, and register those tools on an agent:

```ts
import { AgentBuilder } from '@anvia/core/agent'
import { createSandboxTools, DockerSandbox } from '@anvia/sandbox'
import { Studio } from '@anvia/studio'

const sandbox = DockerSandbox.node({
  network: true,
  limits: {
    timeoutMs: 30_000,
    maxOutputBytes: 128_000,
    maxFileBytes: 1024 * 1024,
    maxProcesses: 4,
  },
})

const session = await sandbox.createSession({
  ports: [3000],
  manifest: {
    files: {
      'README.md': '# Sandbox workspace',
      'server.js': 'console.log("ready")',
    },
  },
})

const tools = createSandboxTools(session, {
  include: [
    'exec_command',
    'read_file',
    'write_file',
    'list_files',
    'list_ports',
    'list_processes',
    'read_process_logs',
  ],
  exec: {
    allowedCommands: ['node'],
    maxTimeoutMs: 30_000,
  },
  readFile: { maxBytes: 128_000 },
  writeFile: { maxBytes: 128_000 },
  process: { maxLogBytes: 64_000 },
})

const agent = new AgentBuilder('sandbox-builder', model)
  .tools(tools)
  .build()
```

`createSandboxTools()` attaches non-enumerable session metadata to each generated tool. Studio uses that metadata to discover the live session; it does not search Docker or another provider for unrelated workspaces. When several tools or agents reference the same session object, Studio shows one workspace with all associated tool and agent names.

## What you can inspect

The Sandbox page combines four read-only surfaces:

| Surface | What Studio shows |
| --- | --- |
| **Files** | One directory level at a time, with breadcrumbs, entry type, and size. |
| **File preview** | UTF-8 text and common image formats, plus a download action. |
| **Published ports** | Container port and protocol mapped to the provider's host and host port. |
| **Managed processes** | Command, arguments, state, and bounded stdout and stderr. |

The workspace summary also identifies the sandbox ID, provider, working directory, associated agents, and the sandbox tools that exposed it.

Studio previews recognized text and image files up to 1 MiB in the browser. Other binary files and larger previews are offered as downloads instead. The HTTP runtime refuses file responses larger than 10 MiB, requires relative paths, rejects traversal outside the workspace, sends file content as `application/octet-stream`, and disables caching for sandbox routes.

Process logs default to the latest 64 KiB of each stream. The API accepts `tailBytes` up to 1 MiB and reports whether stdout or stderr was truncated.

## Capabilities depend on the session

Every discoverable sandbox supports file listing and reading. Ports and managed processes are optional provider capabilities.

| Capability | Studio's requirement | If it is absent |
| --- | --- | --- |
| Files | `listFiles()` and `readFile()` | The session is not discoverable as a sandbox. |
| Ports | A `publishedPorts` array | The UI reports that published ports are unsupported. |
| Processes and logs | Both `listProcesses()` and `readProcessLogs()` | The UI reports that managed processes are unsupported. |

For example, the current `DockerSandbox` session supports files, published ports, and managed processes. A custom sandbox provider may only satisfy the base file-session contract. Studio reports the capabilities of each discovered session instead of assuming feature parity between providers.

An empty list is different from an unsupported capability: “No ports are published” means the provider supports ports but the session has none, while “Published ports are not supported” means the session does not expose that capability.

## Inspector actions versus agent tools

The Sandbox page itself cannot write a file, execute a command, start or stop a process, or destroy a session. Its routes only list and read state.

The registered **agent tools** may have broader powers. In the example above, the model can call `write_file` and `exec_command` from a Playground run because those tools were explicitly included. That does not make the Sandbox inspector writable.

| Surface | Authority |
| --- | --- |
| Sandbox inspector | Read files, list ports and processes, and read bounded logs. |
| Direct tool runner | Executes a selected registered tool immediately. |
| Playground | Lets the model choose from the sandbox tools available to its agent. |

Review [Run tools directly](/studio/tools/run-tools-directly) before invoking a mutating sandbox tool from the Tools page. Apply allowlists, timeouts, file limits, process limits, and approval policies when the model can mutate a workspace.

## Own the lifecycle

Studio discovers a session but does not own or destroy it. The code that creates the sandbox remains responsible for cleanup.

For a long-running local Studio process, `serve()` gives cleanup an explicit place:

```ts
const studio = new Studio([agent])

try {
  await studio.serve({
    hostname: '127.0.0.1',
    port: 4021,
    onShutdown: async () => {
      await session.destroy()
    },
  })
} catch (error) {
  await session.destroy().catch(() => undefined)
  throw error
}
```

`serve()` waits for shutdown, closes Studio, and then calls `onShutdown`. The catch path handles setup or runtime failures that happen outside normal shutdown. After the session is destroyed, an inspector request returns that the sandbox is no longer available; refreshing Studio cannot recreate it.

If you use persistent workspaces, their retention policy still belongs to the sandbox provider. Closing Studio alone is not a deletion or cleanup policy.

## Security boundary

A sandbox reduces the scope of agent execution; it does not make an exposed Studio server safe for untrusted users.

- Bind Studio to `127.0.0.1` or protect it behind your own trusted development access layer.
- Keep provider credentials and host secrets out of sandbox manifests and files.
- Treat file previews, downloads, process commands, logs, and published-port addresses as sensitive.
- Restrict executable commands and network access to what the development task requires.
- Configure CPU, memory, PID, output, file, timeout, and process limits.
- Use the sandbox provider's security settings and a non-privileged container user where appropriate.
- Destroy ephemeral sessions reliably, including failure paths.

Studio is a development inspector, not a hosted sandbox control plane or a production workspace browser.

## Read-only API

The browser uses these inspection routes:

```text
GET /sandboxes
GET /sandboxes/:sandboxRef
GET /sandboxes/:sandboxRef/files?path=.
GET /sandboxes/:sandboxRef/files/content?path=README.md
GET /sandboxes/:sandboxRef/ports
GET /sandboxes/:sandboxRef/processes
GET /sandboxes/:sandboxRef/processes/:processId/logs?tailBytes=65536
```

The sandbox reference is opaque. Use the `ref` returned by `GET /sandboxes` rather than constructing one from the provider and session ID.
