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

`resources.sharedMemoryMb` sizes the container's private `/dev/shm` in MB (`--shm-size`); `security.addCapabilities` adds named Linux capabilities (`--cap-add`) when the default `--cap-drop ALL` is too strict; `security.seccompProfile: { type: 'path', path }` applies a seccomp profile from an absolute host path (`--security-opt seccomp=`). Values are validated: `sharedMemoryMb` must be a positive integer, capability arrays must not contain duplicates, and the seccomp path must be absolute. A Chromium workload that keeps its own sandbox needs `sharedMemoryMb` and a seccomp profile that allows user namespaces.

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

## Shell selection

Natural command lines in `exec_command` and `start_process` prefer `/bin/bash -c`, falling back to
`sh -c` only when Bash is unavailable. Allow-mode policies must permit the selected executable and
set `allowShellInterpreters: true`; allowing only `sh` is insufficient on Bash-equipped images.
Block-mode policies reject natural command lines. Use explicit `{ command, args }` for exact argv
execution. See [Commands](/sdk/advanced/sandbox/commands#natural-command-lines).

## Remote sandbox boundary

`RemoteSandboxHub` authorizes daemon tokens and routes calls; it does not isolate the daemon. The daemon runs on the sandbox host with its own user's privileges, and the commands, processes, terminals, and desktop it starts inherit them.

`authorize(token)` must resolve a token to exactly one sandbox. The hub does not issue or rotate tokens. Use `wss://` for the control URL, keep `ANVIA_SANDBOX_STATE_DIR` outside the workspace, and treat the token as a secret. The daemon removes `ANVIA_SANDBOX_TOKEN` and `ANVIA_CONTROL_URL` from the environment of commands it runs, but that does not make the token safe to expose to sandbox code.

Browser terminals, tunnels, and desktops use short-lived tickets; `createRelayTicketStore()` provides an in-memory single-use store for them, which does not replace a shared store when several server processes run. The hub checks the browser `Origin` before running the authorizer, and `allowedOrigins` covers proxies that rewrite Host. Read-only desktop viewers are enforced by the relay's server-side filtering, not by browser UI.

## Desktop boundary

A desktop is a virtual display inside the sandbox, not a new isolation layer. Its VNC server listens on loopback without a password, and any code that can run in the sandbox can reach it. The daemon always allows the VNC port through a tunnel.

The takeover lock coordinates the agent and a person; it does not decide who may take over. Authorize holders in application code, keep `release({ force: true })` and a bare `release()` in operator-only paths, and treat `desktop_locked` as a coordination signal. Read-only viewers always have their input filtered by the relay; while someone holds control, viewers who are not the holder are filtered too. The lock does not stop sandbox code from connecting to the VNC port directly.

Image contents are part of the boundary. Install only the graphical programs the workflow needs and pin and scan the image. The reference image's `anvia-chromium` launcher uses `--no-sandbox` because Docker's default seccomp profile blocks user namespaces; set `ANVIA_CHROMIUM_SANDBOX=1` and allow user namespaces if Chromium's own sandbox matters more. Clipboard sync is best-effort, audio is not supported, and desktop processes are not persisted across a daemon or sandbox restart.

See the SDK [sandbox security guide](/sdk/advanced/sandbox/security), [remote desktop guide](/sdk/advanced/sandbox/desktop), and [production checklist](/sdk/advanced/sandbox/checklist).
