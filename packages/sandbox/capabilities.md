# Capabilities

The package exposes Docker sandboxes, a remote runtime, an inspection adapter, policy-constrained agent tools, and a supervised desktop.

| Surface | Capability |
| --- | --- |
| Lifecycle | Explicit image check, pull, and ensure; create, list, stop, resume by ID, destroy by ID or handle, and async disposal |
| Commands | Buffered `exec`, string-decoded `execText`, and event-based `execStream`, stdin, env, cwd, timeout, abort signal, and output bounds |
| Files | Binary/text read and write, listing, bounded paged text reads, and creation-time seeding |
| Workspaces | Ephemeral Docker volumes or existing named Docker volumes |
| Processes | Start, list, read bounded logs, and stop long-running processes |
| Ports | Publish declared ports to random loopback host ports and wait for readiness |
| Inspection | Opt-in, read-only file, port, and process capabilities through `sandbox.inspector(...)` |
| Agent tools | Command, file, process, port, and readiness tools (all by default, or an explicit selection) with policy limits, accepting a runtime or a Docker sandbox handle, and `sandboxToolRecovery` for Durable |
| Remote runtime | A hub that accepts daemon connections and exposes a runtime per sandbox, including reconnects, idempotent operations, connection events, `waitForConnection`, and attachment to an existing HTTP server |
| Errors | Provider-neutral `SandboxError`, `SandboxErrorCode`, and `isSandboxError`, including `docker_unavailable` detection |
| Terminals | Interactive PTY sessions through the hub, persistent in tmux when the image has it |
| Tunnels | Byte streams to allowed loopback ports inside the sandbox |
| Desktop | Virtual display, screenshots, input actions, resizing, a control lock, and a VNC viewer path |
| Desktop tools | Screenshot, click, mouse, drag, scroll, type, key, cursor, and wait tools with coordinate scaling |
| Daemon CLI | `anvia-sandbox-daemon` with environment configuration and `--check` / `--require` / `--version`, strict flag validation, and tunnel environment options |
| Image CLI | Generate and optionally build composed runtime images with `create-image`, including from an existing manifest or directory with `--from` |

## Image builder

```sh
pnpm dlx --package=@anvia/sandbox anvia-sandbox create-image \
  --name reports \
  --runtime node \
  --runtime python \
  --feature artifacts
```

The CLI supports curated runtimes and features plus explicit apt, npm, and uv packages. `--dry-run` prints without writing or building; `--no-build` writes the Docker context only. Generated custom package versions can drift unless pinned.

`--feature desktop` adds Node.js and writes an image that installs Xvnc, openbox, xdotool, ImageMagick, xterm, tmux, and the daemon with `node-pty`, then runs it as a non-root `sandbox` user. It cannot be combined with `playwright`. The generated image starts the daemon, so it is for the remote runtime rather than `DockerSandboxClient`.

## Boundaries

The package does not provide a hosted control plane, a token issuer, a scheduler, an artifact registry, a secret manager, or a complete hostile-code guarantee. Images are pulled only when `createSandbox()` receives `pull: 'if-missing'` or `pull: 'always'`, or when you call `pullImage()` or `ensureImage()`. The hub authorizes and routes daemon connections; Docker, the VM, the host, and the daemon user remain part of the isolation boundary. A desktop runs inside the sandbox and is not a separate security boundary.

See [remote sandboxes](/sdk/advanced/sandbox/remote), [desktop](/sdk/advanced/sandbox/desktop), [terminals](/sdk/advanced/sandbox/terminals), [tunnels](/sdk/advanced/sandbox/tunnels), [lifecycle](/packages/sandbox/lifecycle), [security](/packages/sandbox/security), and the [API reference](/packages/sandbox/api-reference).
