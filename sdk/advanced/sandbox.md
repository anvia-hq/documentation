# Sandbox execution

Sandbox execution gives an agent a disposable workspace for commands and files without running model-generated work in the application process. `@anvia/sandbox` provides Docker-backed sessions and turns a live session into ordinary Anvia tools.

## Explore sandbox execution

| Page | Learn how to |
| --- | --- |
| [Create a sandbox](/sdk/advanced/sandbox/create) | Install the package, choose an image, seed a workspace, and attach tools. |
| [File tools and artifacts](/sdk/advanced/sandbox/files) | Bound text reads and writes, then move generated artifacts into application storage. |
| [Command execution](/sdk/advanced/sandbox/commands) | Run commands directly or let an agent use a restricted command tool. |
| [Processes and previews](/sdk/advanced/sandbox/processes) | Manage long-running processes and proxy a loopback-only website preview. |
| [Sessions and cleanup](/sdk/advanced/sandbox/sessions) | Choose ephemeral or persistent workspaces and guarantee cleanup. |
| [Limits and security](/sdk/advanced/sandbox/security) | Layer container, network, resource, tool, and approval controls. |
| [Production checklist](/sdk/advanced/sandbox/checklist) | Review isolation, lifecycle, artifacts, and observability before release. |

## Create a bounded workspace

```ts
import { AgentBuilder } from '@anvia/core'
import { createSandboxTools, DockerSandbox } from '@anvia/sandbox'

const sandbox = DockerSandbox.node({
  network: false,
  limits: {
    timeoutMs: 20_000,
    maxOutputBytes: 64_000,
    maxFileBytes: 256_000,
    memoryMb: 512,
    cpus: 1,
    pidsLimit: 64,
  },
})

const session = await sandbox.createSession({
  manifest: {
    files: {
      'input/ticket.txt': ticket.body,
    },
    directories: ['output'],
  },
})

try {
  const tools = createSandboxTools(session, {
    include: ['list_files', 'read_file', 'write_file', 'exec_command'],
    exec: {
      allowedCommands: ['node'],
      maxTimeoutMs: 20_000,
    },
    readFile: { maxBytes: 64_000 },
    writeFile: { maxBytes: 64_000 },
  })

  const agent = new AgentBuilder('ticket-analyzer', model)
    .instructions([
      'Work only inside the sandbox workspace.',
      'Read input/ticket.txt and write the final report to output/report.md.',
      'Do not claim a command succeeded unless its result confirms success.',
    ].join('\n'))
    .tools(tools)
    .defaultMaxTurns(8)
    .build()

  await agent.prompt('Analyze the ticket and create the report.').send()
  const report = await session.readTextFile('output/report.md')
} finally {
  await session.destroy()
}
```

The session owns the live container and workspace. The application owns when that session may be created, which capabilities the agent receives, what leaves the workspace, and when the session is destroyed.

## Understand the boundaries

```text
application policy
   ├─ image and seeded inputs
   ├─ network and resource limits
   ├─ exposed tools and approvals
   └─ artifact export and cleanup
              ↓
       Docker sandbox session
       ├─ isolated workspace
       ├─ commands and processes
       └─ generated files
              ↓
        selected agent tools
```

A sandbox reduces exposure to the host process; it does not make arbitrary code safe by itself. Treat command execution as a privileged side effect and combine the package with infrastructure isolation appropriate to the trust level of the code.

## Use the right interface

Use `createSandboxTools(...)` for capabilities the model should choose. Use the session methods from trusted application code for setup, artifact export, health checks, and cleanup.

| Need | Interface |
| --- | --- |
| Let the model inspect a source file | `read_file` tool |
| Let the model run an allowed executable | `exec_command` tool |
| Seed trusted input before the run | Session manifest or `session.writeFile(...)` |
| Export a binary result | `session.readFile(...)` |
| Start an application-owned command | `session.exec(...)` or `session.startProcess(...)` |
| End the isolation boundary | `session.destroy()` |

Do not expose every session method merely because the provider supports it. Start from the smallest tool bundle required by the workflow.
