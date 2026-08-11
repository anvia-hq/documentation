# Create a sandbox

Create the sandbox in trusted server or worker code, then give the agent only the session tools required for its task.

## Install the package

```sh
pnpm add @anvia/sandbox @anvia/core
```

`DockerSandbox` invokes Docker on the machine running the application. Docker must be installed, available to that process, and permitted by the deployment environment.

## Choose a runtime

Use a preset when the task needs one standard runtime:

```ts
import { DockerSandbox } from '@anvia/sandbox'

const nodeSandbox = DockerSandbox.node()
const pythonSandbox = DockerSandbox.python()
const denoSandbox = DockerSandbox.deno()
```

The Node preset is a good default for TypeScript and JavaScript work. Choose the runtime from the workload in application code; do not let a prompt select arbitrary images.

## Build a custom image

Create an image when every session needs additional runtimes or pinned dependencies:

```sh
pnpm dlx @anvia/sandbox create-image \
  --name reports \
  --runtime python \
  --feature artifacts
```

The command creates a build context under `.anvia/sandbox-images/reports`, builds the local image, and prints the matching `DockerSandbox` configuration. Add `--no-build` when CI should generate the context without invoking Docker.

Use the generated image explicitly:

```ts
const sandbox = new DockerSandbox({
  image: 'anvia-sandbox-reports:latest',
  pull: 'never',
  network: false,
})
```

Build dependencies into the image instead of installing them during each agent run. This makes startup faster, keeps versions reviewable, and avoids enabling network access only for package installation.

## Set host-owned defaults

```ts
const sandbox = DockerSandbox.node({
  network: false,
  lifecycle: {
    ttlMs: 15 * 60_000,
    idleTimeoutMs: 5 * 60_000,
    autoDestroy: true,
  },
  limits: {
    timeoutMs: 30_000,
    maxOutputBytes: 64_000,
    maxFileBytes: 1_000_000,
    memoryMb: 512,
    cpus: 1,
    pidsLimit: 64,
    maxProcesses: 2,
  },
})
```

Constructor options are the deployment policy shared by sessions created from that sandbox. Keep them in trusted configuration rather than request fields or model output.

## Seed a session

A manifest prepares the workspace before the model can use it:

```ts
const session = await sandbox.createSession({
  id: `report-${job.id}`,
  metadata: {
    jobId: job.id,
    tenantId: job.tenantId,
  },
  manifest: {
    directories: ['input', 'output'],
    files: {
      'input/data.json': JSON.stringify(job.data),
      'README.md': 'Write generated reports to output/.',
    },
    env: {
      REPORT_LOCALE: job.locale,
    },
  },
})
```

Manifest paths must remain inside the sandbox workspace. Keep secrets out of manifest files and environment variables unless the sandboxed process genuinely requires them; commands can read both.

## Expose a narrow tool bundle

```ts
import { createSandboxTools } from '@anvia/sandbox'

const tools = createSandboxTools(session, {
  include: ['list_files', 'read_file', 'write_file', 'exec_command'],
  exec: {
    allowedCommands: ['python'],
    defaultTimeoutMs: 10_000,
    maxTimeoutMs: 30_000,
  },
  readFile: {
    defaultLineCount: 300,
    maxLineCount: 1_000,
    maxBytes: 64_000,
  },
  writeFile: {
    maxBytes: 256_000,
  },
})
```

The default bundle contains `exec_command`, `read_file`, `write_file`, and `list_files`. Prefer an explicit `include` list so a code review can see the model-facing capability boundary.

Published-port and managed-process tools are never part of that default bundle. Add them only for workflows that intentionally manage a live process.

## Handle setup failures separately

Creating a session can fail because Docker is unavailable, image setup fails, or a manifest path is unsafe. Treat those as infrastructure or input failures before starting the agent; they are not problems the model should retry through another tool call.

Once creation succeeds, place the complete use of the session inside `try` and cleanup inside `finally`.
