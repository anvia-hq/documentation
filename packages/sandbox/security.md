# Security

Docker isolation is one layer, not a guarantee that arbitrary hostile code is safe for every deployment. The Docker daemon, host kernel, image provenance, credentials, network, and application proxy all remain in the security boundary.

## Start restrictive

```ts
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  security: {
    readonlyRootfs: true,
    noNewPrivileges: true,
    dropCapabilities: ['ALL'],
  },
  resources: { memoryMb: 512, cpus: 1, pidsLimit: 128 },
  runtime: {
    commandTimeoutMs: 20_000,
    maxOutputBytes: 1_000_000,
    maxFileBytes: 5_000_000,
    maxProcesses: 4,
  },
})
```

Do not mount the Docker socket or sensitive host paths into code that a model can control. Treat access to the Docker daemon itself as privileged host access.

## Tool policy

```ts
const tools = createDockerSandboxTools({
  sandbox: sandbox.runtime,
  tools: ['read_file', 'write_file', 'list_files', 'exec_command'],
  exec: {
    commands: { mode: 'allow', values: ['node', 'pnpm'] },
    maxTimeoutMs: 20_000,
  },
  readFile: { maxBytes: 200_000, maxLineCount: 400 },
  writeFile: { maxBytes: 500_000 },
})
```

Tool selection and policies constrain the interface presented to the model. They do not override Docker configuration or validate the behavior of an allowed executable.

## Paths, output, secrets, and ports

Sandbox file APIs normalize relative workspace paths and reject traversal outside the workspace. Size and line limits prevent accidental unbounded reads, but file contents and command output can still contain secrets.

Avoid placing provider keys, cloud credentials, production datasets, or host identity tokens in sandbox files or environment variables. Port publication requires bridge networking and binds host ports to loopback. Authenticate and authorize any proxy that makes a preview externally reachable.

See the SDK [sandbox security guide](/sdk/advanced/sandbox/security) for application-level controls.
