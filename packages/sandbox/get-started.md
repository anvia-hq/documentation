# Get started

`@anvia/sandbox` requires Node.js `>=20.12`, the Docker CLI, and access to a compatible Docker daemon.

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
