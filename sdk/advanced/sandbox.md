# Sandbox execution

`@anvia/sandbox` gives an agent a disposable Docker-backed workspace for commands, files, processes, and preview ports. A live runtime can be exposed as ordinary Anvia tools without running model-selected commands in the application process.

A container reduces host exposure. It does not make arbitrary hostile code safe by itself.

## 1. Create a bounded workspace

```ts
import { Agent } from '@anvia/core/agent'
import {
  DockerSandboxClient,
  createDockerSandboxTools,
} from '@anvia/sandbox'

const client = new DockerSandboxClient()
await client.pullImage({ image: 'node:22-bookworm' })

const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  files: { 'input/ticket.txt': ticket.body },
  directories: ['output'],
  resources: { memoryMb: 512, cpus: 1, pidsLimit: 64 },
  runtime: {
    commandTimeoutMs: 20_000,
    maxOutputBytes: 64_000,
    maxFileBytes: 256_000,
  },
})

try {
  const tools = createDockerSandboxTools({
    sandbox: sandbox.runtime,
    tools: ['list_files', 'read_file', 'write_file', 'exec_command'],
    exec: {
      commands: { mode: 'allow', values: ['node'] },
      maxTimeoutMs: 20_000,
    },
    readFile: { maxBytes: 64_000 },
    writeFile: { maxBytes: 64_000 },
  })

  const agent = new Agent({
    id: 'ticket-analyzer',
    model,
    instructions: 'Read input/ticket.txt and write output/report.md.',
    tools: [...tools],
    maxTurns: 8,
  })

  const result = await agent.generate({
    prompt: 'Analyze the ticket and create the report.',
  })
  if (result.type !== 'response') throw new Error(`Run outcome: ${result.type}`)

  const report = await sandbox.runtime.readTextFile({
    path: 'output/report.md',
  })
} finally {
  await sandbox.destroy()
}
```

## 2. Use the right interface

Use `createDockerSandboxTools()` only for capabilities the model may choose. Use `sandbox.runtime` from trusted code for setup, validation, artifact export, and processes. Use the `DockerSandbox` handle for inspection, stop, and destruction.

Start with the smallest tool tuple required by the workflow.

### Container runtime

`createSandbox()` accepts `containerRuntime` — the runtime name registered in the Docker daemon (for example `runsc` for gVisor). The runtime must already be registered (`runsc install` followed by a daemon restart); creation fails with a `runtime_not_found` error otherwise. Omit the option to use the daemon default. `resumeSandbox()` keeps the container's original runtime.

Under gVisor, workspace files persist through `stop()`/`resumeSandbox()` because they live on a Docker volume, but changes to the container's writable rootfs outside the workspace do not survive a resume, and `security.seccompProfile` is not enforced the way it is on the default runtime because the gVisor sentry mediates application syscalls itself.

### Command policy defaults

In allow mode, the command policy blocks shell interpreters (`sh`, `bash`, `zsh`, and similar) by default, because they can execute arbitrary commands through their arguments and bypass the allow list. Opt in explicitly with `allowShellInterpreters: true` when the workflow genuinely needs a shell, and prefer the structured `command` plus `args` contract.

## 3. Continue through the section

- [Create a sandbox](/sdk/advanced/sandbox/create)
- [Work with files and artifacts](/sdk/advanced/sandbox/files)
- [Execute commands](/sdk/advanced/sandbox/commands)
- [Manage processes and previews](/sdk/advanced/sandbox/processes)
- [Control lifecycle and cleanup](/sdk/advanced/sandbox/sessions)
- [Set limits and security policy](/sdk/advanced/sandbox/security)
- [Review the production checklist](/sdk/advanced/sandbox/checklist)
