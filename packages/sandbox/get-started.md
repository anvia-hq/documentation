# Get started

`@anvia/sandbox` requires Node.js `>=20.12`, the Docker CLI, and access to a compatible Docker daemon.

```sh
pnpm add @anvia/sandbox @anvia/core
```

Create and always destroy a session:

```ts
import { DockerSandbox } from '@anvia/sandbox'

const sandbox = DockerSandbox.node({
  network: false,
  limits: {
    timeoutMs: 30_000,
    memoryMb: 512,
    cpus: 1,
    pidsLimit: 128,
  },
})

const session = await sandbox.createSession({
  manifest: {
    files: {
      'README.md': '# Temporary workspace\n',
    },
  },
})

try {
  const result = await session.exec({
    command: 'node',
    args: ['--version'],
  })
  console.log(result.stdout)
} finally {
  await session.destroy()
}
```

The default workspace is ephemeral. Networking defaults to disabled, Docker capabilities default to dropped, and no-new-privileges defaults to enabled. The root filesystem is writable unless `readonlyRootfs` is enabled; the workspace remains the intended writable area.

To expose a constrained tool subset to an agent, use `createSandboxTools` after reviewing [security](/packages/sandbox/security). For cleanup and persistent workspaces, read [lifecycle](/packages/sandbox/lifecycle).
