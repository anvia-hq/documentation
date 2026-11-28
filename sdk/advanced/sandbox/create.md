# Create a sandbox

Create sandboxes in trusted server or worker code, then give an agent only the runtime tools required for its task.

## Install and create

```sh
pnpm add @anvia/sandbox @anvia/core
```

```ts
import { DockerSandboxClient } from '@anvia/sandbox'

const client = new DockerSandboxClient()

const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  pull: 'if-missing',
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

Images are explicit. Choose them in application configuration, not from prompt input. The `pull` option controls acquisition during `createSandbox()`:

| `pull` | Behavior |
| --- | --- |
| `'never'` (default) | Fails unless the image is already local. |
| `'if-missing'` | Pulls only when the image is absent. |
| `'always'` | Pulls before every create. |

To keep networked image acquisition a separate, reviewable step, leave the default and call `hasImage()`, `ensureImage()` (pulls only when missing and returns `{ pulled }`), or `pullImage()` (always pulls) yourself.

## Build a custom image

```sh
pnpm dlx --package=@anvia/sandbox anvia-sandbox create-image \
  --name reports \
  --runtime python \
  --feature artifacts
```

Pass `--from <dir|manifest>` to regenerate an image from an existing `anvia-sandbox.json` manifest, and `--version` to print the CLI version.

Use the generated tag as the `image` passed to `createSandbox()`. Build dependencies into the image instead of installing them during each agent run.

## Expose a narrow tool bundle

```ts
import { sandboxToolkit } from '@anvia/sandbox'

const toolkit = sandboxToolkit({
  sandbox, // a DockerSandbox handle or sandbox.runtime
  include: ['list_files', 'read_file', 'write_file', 'exec_command'],
  requiresApproval: { exec_command: true },
  exec: {
    commands: { mode: 'allow', values: ['python'] },
    defaultTimeoutMs: 10_000,
    maxTimeoutMs: 30_000,
  },
  readFile: { defaultLineCount: 300, maxLineCount: 1_000, maxBytes: 64_000 },
  writeFile: { maxBytes: 256_000 },
})
```

Pass the toolkit in the agent's `tools` array. `sandbox` accepts a `DockerSandbox` handle or its `runtime`. When `include` is omitted, the toolkit exposes all ten sandbox tools, including process and port tools. List only the tools the workflow needs, and add process and port tools only for workflows that intentionally manage a live process.

`requiresApproval` pauses the listed tools for review; a boolean applies to every selected tool. `prefix` renames the tools, for example to `docs_exec_command`, when an agent uses two sandboxes. `createDockerSandboxTools()` builds the same tools as a plain array selected with a `tools` tuple.

Creation can fail because Docker is unavailable (`docker_unavailable`), the image or named volume is absent, or an initial path is unsafe. Treat those as infrastructure or input failures before starting the agent. Once creation succeeds, place complete use inside `try` and cleanup in `finally`.
