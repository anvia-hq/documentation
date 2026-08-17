# Capabilities

The package exposes a Docker sandbox client, a runtime contract, an inspection adapter, and policy-constrained agent tools.

| Surface | Capability |
| --- | --- |
| Lifecycle | Explicit image pull, create, stop, resume by ID, destroy, and async disposal |
| Commands | Buffered `exec` and event-based `execStream`, stdin, env, cwd, timeout, abort signal, and output bounds |
| Files | Binary/text read and write, listing, bounded paged text reads, and creation-time seeding |
| Workspaces | Ephemeral Docker volumes or existing named Docker volumes |
| Processes | Start, list, read bounded logs, and stop long-running processes |
| Ports | Publish declared ports to random loopback host ports and wait for readiness |
| Inspection | Opt-in, read-only file, port, and process capabilities through `sandbox.inspector(...)` |
| Agent tools | Explicit command, file, process, port, and readiness tool selection with policy limits |
| Image CLI | Generate and optionally build composed runtime images with `create-image` |

## Image builder

```sh
pnpm dlx @anvia/sandbox create-image \
  --name reports \
  --runtime node \
  --runtime python \
  --feature artifacts
```

The CLI supports curated runtimes/features plus explicit apt, npm, and uv packages. `--dry-run` prints without writing or building; `--no-build` writes the Docker context only. Generated custom package versions can drift unless pinned.

## Boundaries

The package does not provide a remote sandbox service, scheduler, artifact registry, secret manager, automatic image pulling, or complete hostile-code guarantee. Docker and host configuration remain part of the isolation boundary.

See [lifecycle](/packages/sandbox/lifecycle), [security](/packages/sandbox/security), and the [API reference](/packages/sandbox/api-reference).
