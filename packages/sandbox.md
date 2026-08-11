# `@anvia/sandbox`

`@anvia/sandbox` gives agents isolated Docker-backed workspaces for commands, files, long-running processes, and published ports. It can also turn a live sandbox session into policy-constrained Anvia tools.

## Install

```bash
pnpm add @anvia/core @anvia/sandbox
```

Docker must be available to the application process.

## Create a session

```ts
import { DockerSandbox } from '@anvia/sandbox'

const sandbox = DockerSandbox.node({
  network: 'none',
  limits: {
    timeoutMs: 30_000,
    memoryMb: 512,
    cpus: 1,
    pidsLimit: 128,
  },
})

const session = await sandbox.createSession({
  manifest: {
    files: { 'README.md': '# Workspace\n' },
  },
})

try {
  const result = await session.exec({ command: 'node', args: ['--version'] })
  console.log(result.stdout)
} finally {
  await session.destroy()
}
```

## Give tools to an agent

```ts
import { createSandboxTools } from '@anvia/sandbox'

const tools = createSandboxTools(session, {
  allow: ['read_file', 'write_file', 'list_files', 'exec_command'],
  exec: {
    allowedCommands: ['node', 'pnpm'],
    maxTimeoutMs: 30_000,
  },
})
```

The tool policy narrows the session API presented to the model. It is one layer in a larger isolation policy; Docker configuration, host privileges, mounted data, credentials, and network access still determine the real boundary.

## Workspace lifecycle

Ephemeral workspaces are appropriate for one run. Persistent workspaces require an explicit ID and an application policy for cleanup. Always destroy sessions in `finally`, even when lifecycle timers are configured.

## Compatibility

The package requires Node.js 20.12 or newer, a compatible Docker CLI and daemon, and `@anvia/core` as a peer dependency. Port and process capabilities are discoverable because not every future sandbox provider must implement them.

## Next steps

- [Public API](/packages/sandbox/api-reference)
- [Sandbox execution guide](/sdk/advanced/sandbox)
- [Studio sandbox inspector](/studio/sandboxes)
- [Package changelog](https://github.com/anvia-hq/anvia/blob/main/packages/tool-sandbox/CHANGELOG.md)

