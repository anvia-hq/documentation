# Security

Docker isolation is one layer, not a guarantee that arbitrary hostile code is safe for every deployment. The Docker daemon, host kernel, image provenance, credentials, network, and application proxy all remain in the security boundary.

## Start restrictive

```ts
const sandbox = DockerSandbox.node({
  network: false,
  security: {
    readonlyRootfs: true,
    noNewPrivileges: true,
    dropCapabilities: ['ALL'],
  },
  limits: {
    timeoutMs: 20_000,
    maxOutputBytes: 1_000_000,
    maxFileBytes: 5_000_000,
    memoryMb: 512,
    cpus: 1,
    pidsLimit: 128,
    maxProcesses: 4,
  },
})
```

The Docker implementation already defaults to no network, no-new-privileges, and dropping all capabilities. Enable network or capabilities only for a concrete workflow. `readonlyRootfs` is opt-in.

Do not mount the Docker socket or sensitive host paths into code that a model can control. Treat access to the Docker daemon itself as privileged host access.

## Tool policy

```ts
const tools = createSandboxTools(session, {
  allow: ['read_file', 'write_file', 'list_files', 'exec_command'],
  exec: {
    allowedCommands: ['node', 'pnpm'],
    maxTimeoutMs: 20_000,
  },
  readFile: {
    maxBytes: 200_000,
    maxLineCount: 400,
  },
  writeFile: {
    maxBytes: 500_000,
  },
})
```

Tool selection and policies constrain the interface presented to the model. They do not override Docker configuration or validate the behavior of an allowed executable. An allowed shell, package manager, interpreter, or compiler can often launch other programs or access the network when the container permits it.

## Paths, output, and secrets

Sandbox file APIs normalize relative workspace paths and reject traversal outside the workspace. Size and line limits prevent accidental unbounded reads, but model-visible file contents and command output can still contain secrets.

Avoid placing provider keys, cloud credentials, production datasets, or host identity tokens in the sandbox environment. Scrub hooks and logs before exporting them to observability systems.

## Ports

Port publication requires networking and binds Docker host ports to loopback. A reverse proxy or tunnel can still make the preview reachable externally; authenticate and constrain that proxy separately.

See the SDK [sandbox security guide](/sdk/advanced/sandbox/security) for application-level controls.
