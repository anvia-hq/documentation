# Capabilities

The package exposes a provider-neutral sandbox contract and a Docker implementation.

| Surface | Capability |
| --- | --- |
| Presets | `DockerSandbox.node()`, `.python()`, and `.deno()` choose maintained base-image defaults |
| Commands | Buffered `exec` and event-based `execStream`, stdin, env, cwd, timeout, abort signal, output bounds |
| Files | Binary/text read and write, listing, bounded paged text reads, manifest seeding |
| Workspaces | Ephemeral directories or named persistent Docker volumes |
| Processes | Start, list, read bounded logs, and stop long-running processes |
| Ports | Publish declared ports to random loopback host ports and wait for readiness |
| Agent tools | Command, file, process, port, and readiness tools with selection and policy limits |
| Hooks | Observe session create/destroy, command start/end, and file writes |
| Image CLI | Generate and optionally build composed runtime images with `create-image` |

Optional capability guards, `isSandboxPortSession` and `isSandboxProcessSession`, keep application code compatible with future providers that may not implement Docker's full surface.

## Image builder

```sh
pnpm dlx @anvia/sandbox create-image \
  --name reports \
  --runtime node \
  --runtime python \
  --feature artifacts
```

The CLI supports curated runtime/features plus explicit apt, npm, and uv packages. `--dry-run` prints without writing or building; `--no-build` writes the Docker context only. Generated custom package versions can drift unless pinned.

## Boundaries

The package does not provide a remote sandbox service, job scheduler, artifact registry, secret manager, or complete hostile-code guarantee. Docker and host configuration remain part of the real isolation boundary.

See [lifecycle](/packages/sandbox/lifecycle), [security](/packages/sandbox/security), and the [API reference](/packages/sandbox/api-reference).
