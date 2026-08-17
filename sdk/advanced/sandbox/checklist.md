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
