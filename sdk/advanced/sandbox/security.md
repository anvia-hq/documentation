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

`resources.sharedMemoryMb` sizes the container's private `/dev/shm`. `security.addCapabilities` grants specific Linux capabilities after `dropCapabilities`, and `security.seccompProfile: { type: 'path', path }` installs a seccomp profile from an absolute host path. Add these only for workloads that require them, such as keeping Chromium's own process sandbox enabled.

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

In allow mode, shell interpreters (`sh`, `bash`, `zsh`, and similar) are blocked by default because they can execute arbitrary commands through their arguments and bypass the allow list. Opt in with `allowShellInterpreters: true` only when the workflow genuinely needs a shell, and prefer the structured `command` plus `args` contract. For kernel-level isolation beyond the default runtime, pass `containerRuntime: 'runsc'` (gVisor) at sandbox creation; the runtime must already be registered in the daemon.

## Put approval before sensitive operations

`createDockerSandboxTools()` does not add approval requirements. When one operation must pause for review, expose a purpose-built tool with `requiresApproval` and call `sandbox.runtime` inside its handler. Approval does not replace authorization or sandbox policy.

## Treat all sandbox data as exposed

Commands can inspect workspace files and process environment. Sandbox `env` values are passed to Docker as `--env KEY=VALUE` arguments; if a Docker command fails, the resulting `DockerSandboxError` message shows the variable name but replaces the value with `<redacted>` (for example `--env OPENAI_API_KEY=<redacted>`), so those messages are safer to log. That covers error text only, and does not make environment values safe to expose to the commands themselves. Do not seed credentials, unrestricted customer data, hidden prompts, or infrastructure configuration unless the task explicitly requires them. Avoid logging command input, output, or file contents by default.

## Remote sandbox boundary

The [remote runtime](/sdk/advanced/sandbox/remote) moves execution behind a daemon that dials out to a `RemoteSandboxHub`. The hub authorizes daemon tokens and routes calls; it does not provide isolation. The daemon runs on the sandbox host with the privileges of its own user, and anything it starts — commands, processes, terminals, and the desktop — inherits those privileges.

`authorize(token)` must resolve a daemon token to exactly one sandbox and return `null` for anything else. The hub does not issue or rotate tokens; application code owns that lifecycle. Use `wss://` for the control URL, keep the daemon's state directory outside the workspace, and treat the token as a secret even though the daemon removes `ANVIA_SANDBOX_TOKEN` and `ANVIA_CONTROL_URL` from the environment of commands it runs.

Browser relays have their own authorization. Terminals, tunnels, and desktops read a short-lived ticket from the request, and the hub checks the browser `Origin` before the authorizer runs. Set `allowedOrigins` when a proxy rewrites the Host header. A refused ticket returns 401 and a route without an authorizer returns 404; a foreign Origin returns 403. Read-only desktop viewers are enforced by the relay, which filters input on the server rather than relying on browser UI.

## Desktop boundary

A [remote desktop](/sdk/advanced/sandbox/desktop) is a virtual display inside the sandbox. Its VNC server listens on loopback with no password and is reachable through a tunnel, and the daemon always allows its VNC port through. Any code that can run inside the sandbox can also connect to that port directly, so the desktop does not isolate sandbox code from anything the sandbox can already reach.

The takeover lock is a coordination boundary, not authorization. While a person holds control, `act()` calls fail with `desktop_locked`, and the relay drops input from read-only viewers and from viewers who are not the holder. But `takeover()` itself trusts the holder string it is given; authorize who may take over in application code. `release({ force: true })` and a bare `release()` are operator overrides, not something to expose to the agent.

Image contents are part of the boundary. Install only the graphical programs the workflow needs, pin and scan the image, and prefer Xvnc to the Xvfb fallback unless the image already uses the pair. The reference image's `anvia-chromium` launcher runs Chromium with `--no-sandbox` because Docker's default seccomp profile blocks user namespaces; set `ANVIA_CHROMIUM_SANDBOX=1` and allow user namespaces if Chromium's own sandbox matters more than that compatibility. Clipboard sync is best-effort and there is no audio support. Do not place secrets on the desktop clipboard or assume desktop state survives a restart.

For public arbitrary-code execution or strong multi-tenant isolation, add infrastructure controls such as dedicated workers, rootless containers, restrictive seccomp/AppArmor profiles, microVMs, egress policy, image scanning, and host patching.
