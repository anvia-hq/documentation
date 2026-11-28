# `@anvia/sandbox`

`@anvia/sandbox` gives agents isolated Docker-backed workspaces for commands, files, long-running processes, and published ports. It can also turn a live sandbox runtime into policy-constrained Anvia tools. The package includes a remote runtime, a daemon that runs inside any sandbox, and a supervised virtual desktop for agents and people.

## Install

```bash
pnpm add @anvia/core @anvia/sandbox
```

Docker must be available to the application process for local sandboxes. By default, `createSandbox()` requires the image to exist locally. Pass `pull: 'if-missing'` to pull it only when absent, or `pull: 'always'` to pull before every create; `pullImage()` and `ensureImage()` remain available when your application owns image acquisition separately. The remote runtime replaces Docker on the agent host with a daemon inside the sandbox.

## Create a sandbox

```ts
import { DockerSandboxClient } from '@anvia/sandbox'

const client = new DockerSandboxClient()

const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  pull: 'if-missing',
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

## Handle errors

Sandbox failures are `SandboxError` instances with a stable `code`. Narrow with `isSandboxError(error, 'docker_unavailable')`; the same exports are available from `@anvia/sandbox/remote`.

## Give tools to an agent

```ts
import { Agent } from '@anvia/core/agent'
import { sandboxToolkit } from '@anvia/sandbox'

const agent = new Agent({
  id: 'sandbox-coder',
  model,
  tools: [
    sandboxToolkit({
      sandbox, // a DockerSandbox handle or any SandboxRuntime
      include: ['read_file', 'write_file', 'list_files', 'exec_command'],
      requiresApproval: { exec_command: true },
      exec: {
        commands: { mode: 'allow', values: ['node', 'pnpm'] },
        maxTimeoutMs: 30_000,
      },
    }),
  ],
})
```

`sandboxToolkit` returns an `@anvia/core` `Toolkit` named `sandbox`. It accepts the toolkit options `include`, `exclude`, `prefix`, `requiresApproval`, `timeoutMs`, and `instructions`, plus the sandbox tool policies. It adds default instructions about the sandbox tools unless you pass `instructions: false`, and attaches metadata that lets [Studio](/studio/sandboxes) discover the sandbox. `createSandboxTools` and `createDockerSandboxTools` are the lower-level factories: they return a plain tool array selected with `tools`, and carry the same Studio metadata.

The tool policy narrows the runtime API presented to the model. Docker configuration, host privileges, image contents, credentials, and network access still determine the real boundary.

## Run a remote sandbox

A `RemoteSandboxHub` accepts outbound connections from daemons inside sandboxes, so the control plane does not need Docker or direct network access to the sandbox:

```ts
import { sandboxToolkit } from '@anvia/sandbox'
import { RemoteSandboxHub } from '@anvia/sandbox/remote'

const daemonToken = process.env.ANVIA_SANDBOX_TOKEN ?? ''

const hub = new RemoteSandboxHub({
  authorize: (token) => (token === daemonToken ? { sandboxId: 'sbx_123' } : null),
})
await hub.listen({ port: 8787, path: '/daemon' })

const sandbox = hub.runtime('sbx_123', { workdir: '/workspace' })
const toolkit = sandboxToolkit({
  sandbox,
  include: ['exec_command', 'read_file', 'write_file', 'list_files'],
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
import { desktopToolkit } from '@anvia/sandbox'

const desktop = desktopToolkit({
  sandbox: hub.desktop('sbx_123'),
  include: ['desktop_screenshot', 'desktop_click', 'desktop_key'],
})
```

Use `create-image --name desk --feature desktop` to build an image with the daemon and desktop programs, or start from the reference image. The desktop is not available on the local `DockerSandboxClient` runtime. See [Remote desktop](/sdk/advanced/sandbox/desktop).

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
