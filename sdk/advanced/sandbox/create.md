# Create a sandbox

Create sandboxes in trusted server or worker code, then give an agent only the runtime tools required for its task.

## Install and create

```sh
pnpm add @anvia/sandbox @anvia/core
```

```ts
import { DockerSandboxClient } from '@anvia/sandbox'

const client = new DockerSandboxClient()
await client.pullImage({ image: 'node:22-bookworm' })

const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  directories: ['input', 'output'],
  files: {
    'input/data.json': JSON.stringify(job.data),
    'README.md': 'Write generated reports to output/.',
  },
  env: { REPORT_LOCALE: job.locale },
  resources: { memoryMb: 512, cpus: 1, pidsLimit: 64 },
  runtime: {
    commandTimeoutMs: 30_000,
    maxOutputBytes: 64_000,
    maxFileBytes: 1_000_000,
    maxProcesses: 2,
  },
})
```

Images are explicit and must be local. Choose them in application configuration, not from prompt input. `pullImage()` makes networked image acquisition a separate, reviewable operation.

## Build a custom image

```sh
pnpm dlx @anvia/sandbox create-image \
  --name reports \
  --runtime python \
  --feature artifacts
```

Use the generated tag as the `image` passed to `createSandbox()`. Build dependencies into the image instead of installing them during each agent run.

## Expose a narrow tool bundle

```ts
import { createDockerSandboxTools } from '@anvia/sandbox'

const tools = createDockerSandboxTools({
  sandbox: sandbox.runtime,
  tools: ['list_files', 'read_file', 'write_file', 'exec_command'],
  exec: {
    commands: { mode: 'allow', values: ['python'] },
    defaultTimeoutMs: 10_000,
    maxTimeoutMs: 30_000,
  },
  readFile: { defaultLineCount: 300, maxLineCount: 1_000, maxBytes: 64_000 },
  writeFile: { maxBytes: 256_000 },
})
```

The tool tuple is required and ordered. Add process and port tools only for workflows that intentionally manage a live process.

Creation can fail because Docker is unavailable, the image or named volume is absent, or an initial path is unsafe. Treat those as infrastructure or input failures before starting the agent. Once creation succeeds, place complete use inside `try` and cleanup in `finally`.
