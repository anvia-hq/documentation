# Limits and security

Sandbox security is layered. No single command list, prompt, or Docker flag is sufficient for arbitrary untrusted code.

## Start from restrictive Docker defaults

`DockerSandbox` disables networking by default, enables `noNewPrivileges`, and drops all Docker capabilities. Keep those defaults unless the workflow has a reviewed reason to change them.

```ts
const sandbox = DockerSandbox.node({
  network: false,
  security: {
    noNewPrivileges: true,
    dropCapabilities: ['ALL'],
    readonlyRootfs: true,
  },
  limits: {
    timeoutMs: 20_000,
    maxOutputBytes: 64_000,
    maxFileBytes: 1_000_000,
    memoryMb: 512,
    cpus: 1,
    pidsLimit: 64,
    maxProcesses: 2,
  },
})
```

The workspace volume remains the place for writable task files when the container root filesystem is read-only. Test the selected image because some runtimes and package managers expect writable temporary or cache directories.

## Keep networking off by default

Network access changes what sandboxed code can reach and exfiltrate. Enable it only when the task requires an outbound dependency or a published preview port.

Avoid `network: 'host'` for model-generated commands. Prefer a dedicated restricted network, infrastructure egress controls, and application-owned proxying when network access is necessary. Container networking alone is not a tenant authorization policy.

Never mount the Docker socket, cloud credential directories, broad host paths, or the application repository into an untrusted workspace.

## Separate runtime and tool limits

Runtime limits apply to the sandbox session. Tool policies determine what the model can request:

```ts
const tools = createSandboxTools(session, {
  include: ['list_files', 'read_file', 'exec_command'],
  exec: {
    allowedCommands: ['node'],
    blockedCommands: ['curl', 'wget', 'ssh'],
    defaultTimeoutMs: 5_000,
    maxTimeoutMs: 15_000,
  },
  readFile: {
    defaultLineCount: 300,
    maxLineCount: 1_000,
    maxBytes: 64_000,
  },
})
```

Only expose `write_file`, process tools, or published ports when the workflow needs them. Tool descriptions and agent instructions guide the model; `include`, executable policies, and limits enforce the capability boundary.

## Put approval before sensitive operations

Some workflows need a human or application decision before a sandbox tool runs:

```ts
const agent = new AgentBuilder('workspace-reviewer', model)
  .instructions('Inspect the workspace and propose changes before writing.')
  .tools(createSandboxTools(session, {
    include: ['list_files', 'read_file', 'write_file', 'exec_command'],
    exec: { allowedCommands: ['node'] },
  }))
  .approvals({
    handler: async (approval) => ({
      approved: await reviewSandboxAction({
        userId: request.user.id,
        tenantId: request.tenant.id,
        approval,
      }),
      reason: 'Reviewed against the workspace policy.',
    }),
  })
  .build()
```

Approval should evaluate authenticated product identity and the proposed operation. It does not replace command, network, or resource limits, and a prompt cannot grant its own approval.

## Treat all sandbox data as exposed

Commands can inspect workspace files and process environment. Do not seed credentials, unrestricted customer data, hidden prompts, or infrastructure configuration unless the task explicitly requires them.

When a credential is unavoidable:

- issue a short-lived credential with the smallest scope
- restrict network destinations outside the container
- keep it out of model-visible tool results and logs
- revoke or expire it after the session
- assume sandboxed code can read and transmit it

## Observe without leaking payloads

Sandbox hooks can record session, command, file-write, and cleanup lifecycle events without making them model-facing:

```ts
const sandbox = DockerSandbox.node({
  hooks: {
    onSessionCreate: (event) => audit.sandboxCreated(event),
    onExecStart: (event) => audit.commandStarted(event),
    onExecEnd: (event) => audit.commandFinished({
      sessionId: event.sessionId,
      command: event.command,
      exitCode: event.result.exitCode,
      durationMs: event.result.durationMs,
    }),
    onFileWrite: (event) => audit.fileWritten(event),
    onDestroy: (event) => audit.sandboxDestroyed(event),
  },
})
```

Avoid recording command input, stdout, stderr, or file contents by default. Those payloads can contain source code, customer data, and secrets.

## Match isolation to trust

Docker is useful process isolation, not a universal hostile-code boundary. For public arbitrary-code execution or strong multi-tenant isolation, add infrastructure controls such as dedicated workers, rootless containers, restrictive seccomp/AppArmor profiles, microVMs or disposable VMs, network egress policy, image scanning, and host patching.

Use `@anvia/sandbox` as the execution interface inside that architecture—not as the entire security architecture.
