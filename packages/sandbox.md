# `@anvia/sandbox`

`@anvia/sandbox` gives agents isolated Docker-backed workspaces for commands, files, long-running processes, and published ports. It can also turn a live sandbox runtime into policy-constrained Anvia tools.

## Install

```bash
pnpm add @anvia/core @anvia/sandbox
```

Docker must be available to the application process. Images must exist locally before `createSandbox()` runs; call `pullImage()` explicitly when your application owns image acquisition.

## Create a sandbox

```ts
import { DockerSandboxClient } from '@anvia/sandbox'

const client = new DockerSandboxClient()
await client.pullImage({ image: 'node:22-bookworm' })

const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  files: { 'README.md': '# Workspace\n' },
  resources: {
    memoryMb: 512,
    cpus: 1,
    pidsLimit: 128,
  },
  runtime: {
    commandTimeoutMs: 30_000,
    maxOutputBytes: 64_000,
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

## Give tools to an agent

```ts
import { createDockerSandboxTools } from '@anvia/sandbox'

const tools = createDockerSandboxTools({
  sandbox: sandbox.runtime,
  tools: ['read_file', 'write_file', 'list_files', 'exec_command'],
  exec: {
    commands: { mode: 'allow', values: ['node', 'pnpm'] },
    maxTimeoutMs: 30_000,
  },
})
```

The tool policy narrows the runtime API presented to the model. Docker configuration, host privileges, image contents, credentials, and network access still determine the real boundary.

## Workspace lifecycle

Use `{ type: 'ephemeral' }` for one task. A `{ type: 'docker-volume', name }` workspace reuses an existing Docker volume that the application owns. Always destroy sandbox handles in `finally`; use `stop()` followed by `client.resumeSandbox({ id })` only when a workflow intentionally pauses and resumes the same container.

## Compatibility

The package requires Node.js 20.12 or newer, a compatible Docker CLI and daemon, and `@anvia/core` as a peer dependency.

## Next steps

- [Public API](/packages/sandbox/api-reference)
- [Sandbox execution guide](/sdk/advanced/sandbox)
- [Studio sandbox inspector](/studio/sandboxes)
- [Package changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/tool-sandbox/CHANGELOG.md)
