# Get started

`@anvia/sandbox` requires Node.js `>=20.12` and `@anvia/core`. Local sandboxes also require the Docker CLI and access to a compatible Docker daemon; the remote runtime runs the same interface behind a daemon and hub.

```sh
pnpm add @anvia/sandbox @anvia/core
```

Create and always destroy a sandbox:

```ts
import { DockerSandboxClient } from '@anvia/sandbox'

const client = new DockerSandboxClient()
await client.pullImage({ image: 'node:22-bookworm' })

const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  files: { 'README.md': '# Temporary workspace\n' },
  resources: { memoryMb: 512, cpus: 1, pidsLimit: 128 },
  runtime: { commandTimeoutMs: 30_000, maxOutputBytes: 64_000 },
  security: {
    noNewPrivileges: true,
    dropCapabilities: ['ALL'],
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

The image, workspace, and network policy are explicit. The root filesystem is writable unless `readonlyRootfs` is enabled; the workspace remains the intended writable area.

To expose a constrained tool subset to an agent, use `createDockerSandboxTools` after reviewing [security](/packages/sandbox/security). For stopping, resuming, and persistent volumes, read [lifecycle](/packages/sandbox/lifecycle).

## Run against a remote sandbox

The remote runtime runs the same interface behind a daemon inside the sandbox. The daemon dials out to a `RemoteSandboxHub`, so the agent host does not need Docker or a route to the sandbox:

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

Start the daemon in the sandbox. `anvia-sandbox-daemon` is a binary shipped by `@anvia/sandbox`, so name the
package when it is not already installed locally:

```sh
ANVIA_CONTROL_URL=wss://agents.example.com/daemon \
ANVIA_SANDBOX_TOKEN=<token> \
ANVIA_SANDBOX_WORKDIR=/workspace \
npm exec --package=@anvia/sandbox -- anvia-sandbox-daemon
```

The hub authorizes each daemon to one sandbox and routes calls; it does not create or destroy sandboxes. The same hub exposes interactive terminals, loopback tunnels, and a desktop for a sandbox. See [Remote sandboxes](/sdk/advanced/sandbox/remote).

## Build a desktop image

For a virtual display that an agent can see and drive, generate an image with the desktop programs and daemon:

```sh
pnpm dlx --package=@anvia/sandbox anvia-sandbox create-image --name desk --feature desktop
docker run --rm anvia-sandbox-desk:latest \
  /opt/anvia-daemon/node_modules/.bin/anvia-sandbox-daemon --check --require=desktop
```

Then run it against the hub with `ANVIA_CONTROL_URL` and `ANVIA_SANDBOX_TOKEN`. Desktops are available only on remote sandboxes. See [Remote desktop](/sdk/advanced/sandbox/desktop).
