# Limits and security

Sandbox security is layered. No single command list, prompt, or Docker flag is sufficient for arbitrary untrusted code.

## Create with restrictive policy

```ts
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  security: {
    noNewPrivileges: true,
    dropCapabilities: ['ALL'],
    readonlyRootfs: true,
  },
  resources: { memoryMb: 512, cpus: 1, pidsLimit: 64 },
  runtime: {
    commandTimeoutMs: 20_000,
    maxOutputBytes: 64_000,
    maxFileBytes: 1_000_000,
    maxProcesses: 2,
  },
})
```

Enable bridge networking only for a reviewed workflow. Never mount the Docker socket, cloud credential directories, broad host paths, or the application repository into an untrusted workspace.

## Separate runtime and tool limits

```ts
const tools = createDockerSandboxTools({
  sandbox: sandbox.runtime,
  tools: ['list_files', 'read_file', 'exec_command'],
  exec: {
    commands: { mode: 'allow', values: ['node'] },
    defaultTimeoutMs: 5_000,
    maxTimeoutMs: 15_000,
  },
  readFile: { defaultLineCount: 300, maxLineCount: 1_000, maxBytes: 64_000 },
})
```

Tool selection and policies constrain what the model may request. The selected image, runtime limits, resource controls, security flags, and network policy constrain the container.

## Put approval before sensitive operations

`createDockerSandboxTools()` does not add approval requirements. When one operation must pause for review, expose a purpose-built tool with `requiresApproval` and call `sandbox.runtime` inside its handler. Approval does not replace authorization or sandbox policy.

## Treat all sandbox data as exposed

Commands can inspect workspace files and process environment. Do not seed credentials, unrestricted customer data, hidden prompts, or infrastructure configuration unless the task explicitly requires them. Avoid logging command input, output, or file contents by default.

For public arbitrary-code execution or strong multi-tenant isolation, add infrastructure controls such as dedicated workers, rootless containers, restrictive seccomp/AppArmor profiles, microVMs, egress policy, image scanning, and host patching.
