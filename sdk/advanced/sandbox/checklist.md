# Production checklist

Review the complete execution boundary before allowing agents to run commands or modify files.

## Workload and image

- Confirm isolated command execution is necessary; prefer a normal typed tool for a known application operation.
- Pin and scan the sandbox image used in production.
- Build required dependencies into the image instead of installing them during runs.
- Keep runtime and image selection in trusted configuration.
- Test the image with a read-only root filesystem when the workload permits it.

## Tenant and data boundaries

- Create a separate ephemeral sandbox for each independent task by default.
- Scope persistent workspace IDs to a tenant and resource.
- Authorize every creation, reopen, artifact download, and preview request.
- Seed only the files and environment values required by the task.
- Keep application credentials and broad customer datasets outside the workspace.
- Prevent concurrent writers to a persistent workspace unless explicitly supported.

## Capabilities

- Use an explicit, non-empty `tools` tuple for model-facing tools.
- Prefer executable allowlists over blocklists.
- Keep network access disabled unless the task requires it.
- Add file writes, processes, and ports only for workflows that need them.
- Put approval in front of sensitive commands and writes.
- Enforce permissions in application code rather than agent instructions.

## Resource controls

- Set command timeout and maximum output bytes.
- Bound file size and paginated text reads.
- Set memory, CPU, and PID limits.
- Cap managed process count and retained process logs.
- Reconcile stopped or leaked containers after worker crashes.
- Load-test the host for concurrent container creation and execution.

## Lifecycle and durability

- Destroy sandboxes in `finally` from the code that creates them.
- Export required artifacts before destroying an ephemeral sandbox.
- Copy accepted artifacts to tenant-scoped durable object storage.
- Define retention and deletion for persistent workspaces.
- Delete application-owned Docker volumes through a separate retention path.
- Keep job status and artifact references in the product database.

## Previews and network

- Pre-authorize container ports in application code.
- Bind preview servers to `0.0.0.0` inside the container.
- Keep published host ports on loopback.
- Put an authenticated, tenant-aware proxy in front of previews.
- Apply infrastructure egress policy when networking is enabled.
- Never mount the Docker socket or broad host paths into the workspace.

## Remote execution

- Authorize every daemon token to exactly one sandbox; return `null` for unknown tokens.
- Issue, rotate, and revoke daemon tokens in application code; the hub does not manage them.
- Use `wss://` for the control URL and keep the daemon state directory outside the workspace.
- Set `connectTimeoutMs` and `heartbeatIntervalMs` for the deployment's link latency.
- Treat the hub as a control plane, not an isolation layer; apply container, VM, and host controls separately.
- Authorize browser terminal, tunnel, and desktop upgrades with application-issued tickets.
- Set `allowedOrigins` when a proxy rewrites the Host header, and test that foreign Origins get 403.
- Decide what happens to in-flight work when a daemon reconnects or a second daemon replaces it.

## Remote desktop

- Build the desktop from a pinned, scanned image with only the programs the workflow needs.
- Install Xvnc, or Xvfb with x11vnc, plus xdotool, xrandr, and ImageMagick; verify with `--check --require=desktop`.
- Choose the starting and maximum resolution deliberately; larger displays cost CPU and bandwidth.
- Set `lock.leaseMs`, `lock.maxLeaseMs`, and `lock.waitForReleaseMs` for the expected human takeover.
- Authorize who may take over and who may only watch; do not rely on `desktop_locked` for authorization.
- Keep `release({ force: true })` and a bare `release()` in operator-only code paths.
- Treat the VNC port as reachable by any code in the sandbox; it is not a security boundary.
- Decide the Chromium sandbox tradeoff explicitly when using the reference image.
- Do not put secrets on the desktop clipboard; clipboard sync is best-effort and audio is not supported.
- Expect desktop processes and state to be lost on daemon or sandbox restart; persist files in the workspace.

## Observability and testing

- Correlate sandboxes with product jobs and tenants through validated IDs and labels.
- Record creation, command status, file writes, and destruction in the owning application layer.
- Omit command output and file contents from logs unless policy explicitly allows them.
- Alert on timeouts, output truncation, leaked sessions, and resource saturation.
- Test rejected traversal and absolute paths.
- Test blocked executables, excessive timeouts, oversized files, and aborted commands.
- Test that failures still destroy ephemeral sandboxes.
- Test that unauthorized users cannot reopen workspaces, download artifacts, or reach previews.

## Stronger isolation

For hostile code or strong multi-tenant requirements, verify the deployment also provides the required host and infrastructure controls: rootless execution, restrictive seccomp/AppArmor policy, dedicated workers or VMs, network egress restrictions, patched hosts, and monitored image provenance.
