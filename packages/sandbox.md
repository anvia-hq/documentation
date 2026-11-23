# `@anvia/sandbox`

`@anvia/sandbox` gives agents isolated Docker-backed workspaces for commands, files, long-running processes, and published ports. It can also turn a live sandbox runtime into policy-constrained Anvia tools. The package includes a remote runtime, a daemon that runs inside any sandbox, and a supervised virtual desktop for agents and people.

## Install

```bash
pnpm add @anvia/core @anvia/sandbox
```

Docker must be available to the application process for local sandboxes. Images must exist locally before `createSandbox()` runs; call `pullImage()` explicitly when your application owns image acquisition. The remote runtime replaces Docker on the agent host with a daemon inside the sandbox.

## Create a sandbox

```ts
import { DockerSandboxClient } from '@anvia/sandbox'

const client = new DockerSandboxClient()
await client.pullImage({ image: 'node:22-bookworm' })

const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  files: { 'README.md': '# Workspace\n' },
  resources: {
    memoryMb: 512,
    cpus: 1,
    pidsLimit: 128,
  },
  runtime: {
    commandTimeoutMs: 30_000,
    maxOutputBytes: 64_000,
  },
})

try {
  const result = await sandbox.runtime.exec({
    command: 'node',
    args: ['--version'],
  })
  console.log(new TextDecoder().decode(result.stdout))
} finally {
  await sandbox.destroy()
}
```

## Give tools to an agent

```ts
import { createDockerSandboxTools } from '@anvia/sandbox'

const tools = createDockerSandboxTools({
  sandbox: sandbox.runtime,
  tools: ['read_file', 'write_file', 'list_files', 'exec_command'],
  exec: {
    commands: { mode: 'allow', values: ['node', 'pnpm'] },
    maxTimeoutMs: 30_000,
  },
})
```

The tool policy narrows the runtime API presented to the model. Docker configuration, host privileges, image contents, credentials, and network access still determine the real boundary.

## Run a remote sandbox

A `RemoteSandboxHub` accepts outbound connections from daemons inside sandboxes, so the control plane does not need Docker or direct network access to the sandbox:

```ts
import { createSandboxTools } from '@anvia/sandbox'
import { RemoteSandboxHub } from '@anvia/sandbox/remote'

const daemonToken = process.env.ANVIA_SANDBOX_TOKEN ?? ''

const hub = new RemoteSandboxHub({
  authorize: (token) => (token === daemonToken ? { sandboxId: 'sbx_123' } : null),
})
await hub.listen({ port: 8787, path: '/daemon' })

const sandbox = hub.runtime('sbx_123', { workdir: '/workspace' })
const tools = createSandboxTools({
  sandbox,
  tools: ['exec_command', 'read_file', 'write_file', 'list_files'],
})
```

Start the daemon inside the sandbox with `ANVIA_CONTROL_URL` and `ANVIA_SANDBOX_TOKEN`:

```sh
ANVIA_CONTROL_URL=wss://agents.example.com/daemon \
ANVIA_SANDBOX_TOKEN=<token> \
npm exec --package=@anvia/sandbox -- anvia-sandbox-daemon
```

The hub authorizes, routes, and reports connected sandboxes. It never creates, stops, or destroys one. The same hub exposes `hub.terminal(id)` for interactive shells and `hub.tunnel(id)` for loopback byte streams. See [Remote sandboxes](/sdk/advanced/sandbox/remote) for connection behavior, terminals, and tunnels.

## Give an agent a desktop

A remote sandbox image with the desktop programs can expose a virtual display. Using the hub from the previous example:

```ts
import { createDesktopTools } from '@anvia/sandbox'

const tools = createDesktopTools({
  sandbox: hub.desktop('sbx_123'),
  tools: ['desktop_screenshot', 'desktop_click', 'desktop_key'],
})
```

Use `create-image --feature desktop` to build an image with the daemon and desktop programs, or start from the reference image. The desktop is not available on the local `DockerSandboxClient` runtime. See [Remote desktop](/sdk/advanced/sandbox/desktop).

## Workspace lifecycle

Use `{ type: 'ephemeral' }` for one task. A `{ type: 'docker-volume', name }` workspace reuses an existing Docker volume that the application owns. Always destroy sandbox handles in `finally`; use `stop()` followed by `client.resumeSandbox({ id })` only when a workflow intentionally pauses and resumes the same container.

## Compatibility

The package requires Node.js 20.12 or newer and `@anvia/core` as a peer dependency. Local sandboxes also require a compatible Docker CLI and daemon. Remote sandboxes require a daemon image and a hub host. The desktop additionally needs Xvnc (or Xvfb with x11vnc), `xdotool`, `xrandr`, and ImageMagick.

## Next steps

- [Remote sandboxes](/sdk/advanced/sandbox/remote)
- [Remote desktop](/sdk/advanced/sandbox/desktop)
- [Interactive terminals](/sdk/advanced/sandbox/terminals)
- [Loopback tunnels](/sdk/advanced/sandbox/tunnels)
- [Public API](/packages/sandbox/api-reference)
- [Sandbox execution guide](/sdk/advanced/sandbox)
- [Studio sandbox inspector](/studio/sandboxes)
- [Package changelog](https://github.com/anvia-hq/anvia/blob/main/packages/tool-sandbox/CHANGELOG.md)
