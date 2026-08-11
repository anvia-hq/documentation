# When should I use sandbox execution?

Use `@anvia/sandbox` when an agent needs a bounded workspace for files, commands, processes, or preview ports and running that work in the application process would create an unacceptable boundary.

## What does the package provide?

It provides Docker-backed sessions plus optional agent tools for selected file and command operations. The application can seed inputs, expose a narrow tool set, export artifacts, and destroy the workspace afterward.

```ts
import { createSandboxTools, DockerSandbox } from '@anvia/sandbox'

const sandbox = DockerSandbox.node({
  network: false,
  limits: {
    timeoutMs: 20_000,
    memoryMb: 512,
    cpus: 1,
  },
})

const session = await sandbox.createSession()

try {
  const tools = createSandboxTools(session, {
    include: ['list_files', 'read_file'],
  })
} finally {
  await session.destroy()
}
```

## Does Docker make arbitrary code safe?

No. A sandbox reduces exposure to the host process; it is not the entire security architecture. The application still owns image selection, host privileges, mounts, network and egress, resource limits, allowed commands, credentials, approvals, artifact review, audit policy, and cleanup.

Keep networking disabled by default, never mount the Docker socket or broad host paths, and expose only the tools required by the task. Use stronger isolation such as dedicated workers or disposable VMs when the threat model requires it.

## What does it require?

The current package requires Node.js 20.12 or newer and a compatible Docker CLI and daemon. Optional capabilities such as ports and processes are discoverable rather than guaranteed for every future sandbox provider.

Start with the [Sandbox execution guide](/sdk/advanced/sandbox), review [Limits and security](/sdk/advanced/sandbox/security), and use the [package reference](/packages/sandbox). Studio can inspect active sessions through its [sandbox inspector](/studio/sandboxes), but inspection does not replace runtime policy.
