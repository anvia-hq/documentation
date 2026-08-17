# When should I use sandbox execution?

Use `@anvia/sandbox` when an agent needs a bounded Docker workspace for files, commands, processes, or preview ports and running that work in the application process would create an unacceptable boundary.

## What does the package provide?

It provides a Docker client and runtime plus optional agent tools for selected operations. The application owns image selection, input seeding, exposed tools, artifact export, and cleanup.

```ts
import {
  DockerSandboxClient,
  createDockerSandboxTools,
} from '@anvia/sandbox'

const client = new DockerSandboxClient()
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  resources: { memoryMb: 512, cpus: 1 },
  runtime: { commandTimeoutMs: 20_000 },
})

try {
  const tools = createDockerSandboxTools({
    sandbox: sandbox.runtime,
    tools: ['list_files', 'read_file'],
  })
} finally {
  await sandbox.destroy()
}
```

## Does Docker make arbitrary code safe?

No. The application still owns image provenance, host privileges, network and egress, resource limits, allowed commands, credentials, approvals, artifact review, audit policy, and cleanup. Use stronger isolation such as dedicated workers or disposable VMs when the threat model requires it.

## What does it require?

The current package requires Node.js 20.12 or newer and a compatible Docker CLI and daemon. Images must be local before creation; call `pullImage()` when the application should acquire one.

Start with the [Sandbox execution guide](/sdk/advanced/sandbox), review [Limits and security](/sdk/advanced/sandbox/security), and use the [package reference](/packages/sandbox).
