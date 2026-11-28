# When should I use sandbox execution?

Use `@anvia/sandbox` when an agent needs a bounded workspace for files, commands, processes, terminals, or preview ports and running that work in the application process would create an unacceptable boundary.

## What does the package provide?

It provides two runtimes plus optional agent tools for selected operations:

- **Local Docker.** `DockerSandboxClient` creates and controls containers on the application host.
- **Remote.** A daemon inside each sandbox connects out to a `RemoteSandboxHub` from `@anvia/sandbox/remote`, so the agent host needs no Docker or direct network access to the sandbox. Remote sandboxes also offer interactive terminals, tunnels, and a virtual desktop; see [Can an agent use a computer or desktop?](/faqs/capabilities/desktop-agents).

The application owns image selection, input seeding, exposed tools, artifact export, and cleanup.

```ts
import {
  DockerSandboxClient,
  sandboxToolkit,
} from '@anvia/sandbox'

const client = new DockerSandboxClient()
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  pull: 'if-missing',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  resources: { memoryMb: 512, cpus: 1 },
  runtime: { commandTimeoutMs: 20_000 },
})

try {
  const toolkit = sandboxToolkit({
    sandbox,
    include: ['list_files', 'read_file'],
  })
  // Pass `toolkit` in an Agent's tools and run it before the sandbox is destroyed.
} finally {
  await sandbox.destroy()
}
```

## Does Docker make arbitrary code safe?

No. The application still owns image provenance, host privileges, network and egress, resource limits, allowed commands, credentials, approvals, artifact review, audit policy, and cleanup. Use stronger isolation such as dedicated workers or disposable VMs when the threat model requires it.

## What does it require?

The package requires Node.js 20.12 or newer; Bun 1.3.14 is also tested. Local sandboxes need a compatible Docker CLI and daemon, and by default images must be local before creation; pass `pull: 'if-missing'` to `createSandbox()` or call `pullImage()` when the application should acquire one. The remote runtime instead needs a POSIX daemon host with outbound WebSocket access.

Start with the [Sandbox execution guide](/sdk/advanced/sandbox), [remote sandboxes](/sdk/advanced/sandbox/remote), review [Limits and security](/sdk/advanced/sandbox/security), and use the [package reference](/packages/sandbox).

Reviewed against Anvia SDK `7aa42c0a` on 2026-11-24.
