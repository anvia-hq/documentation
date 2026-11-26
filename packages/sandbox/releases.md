# Releases

The reviewed source release is `@anvia/sandbox` **1.4.0**. The entries below preserve notable v0 history.

## Changes in 1.4.0

Reviewed `1.3.5` → `1.4.0` against SDK source on 2026-11-26. Improves developer experience across Docker sandboxes, remote hubs, tools, and the CLIs. See the [API reference](/packages/sandbox/api-reference) for each export.

- `SandboxError`, `SandboxErrorCode`, and `isSandboxError` are exported from `@anvia/sandbox` and `@anvia/sandbox/remote`; Docker CLI failures include a redacted stderr snippet and `docker_unavailable` detection.
- `DockerSandboxClient` gains `hasImage`, `ensureImage`, `listSandboxes`, and `destroySandbox`; `SandboxRuntime` gains `execText` and accepts workdir-absolute paths.
- `createSandboxTools` and `createDockerSandboxTools` accept a `DockerSandbox` handle, default `tools` to all tools, and `sandboxToolRecovery` is exported for `@anvia/durable`.
- `RemoteSandboxHub` adds `onConnect`, `onDisconnect`, `onError`, `capabilities`, `waitForConnection`, `attach`, and async disposal; `SandboxDaemon` is `AsyncDisposable`, terminal and tunnel handles are `Disposable`, and `createRelayTicketStore` backs browser relay tickets.
- `anvia-sandbox` adds `--from <dir|manifest>` and `--version`; `anvia-sandbox-daemon` validates flags strictly, adds `--version`, and reads `ANVIA_SANDBOX_TUNNEL*` environment options.

## Changes in 1.3.5

Reviewed `1.3.2` → `1.3.5` against SDK source on 2026-11-23. Stops desktop helper and agent processes reliably and kills terminal sessions that ignore SIGHUP.

## Changes through 1.3.2

Reviewed `1.2.1` → `1.3.2` against SDK source on 2026-11-04. The 1.3 line added the provider-neutral runtime, the remote hub and daemon, interactive terminals, loopback tunnels, a desktop, and Studio views. See [Remote sandboxes](/sdk/advanced/sandbox/remote), [Remote terminals](/sdk/advanced/sandbox/terminals), and [Remote tunnels](/sdk/advanced/sandbox/tunnels).

Reviewed `1.1.8` → `1.2.0` against SDK source on 2026-10-15. Natural commands in `exec_command` and `start_process` now prefer `/bin/bash -c`, falling back to `sh -c` only if Bash is unavailable. Allow policies check the selected executable; explicit argv and low-level APIs keep their behavior. See [Commands](/sdk/advanced/sandbox/commands#natural-command-lines).

See the [source changelog](https://github.com/anvia-hq/anvia/blob/7815383f045fa45ac64534bbfcc67fcb52b70e86/packages/tool-sandbox/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

| Version | Summary |
| --- | --- |
| `1.4.0` | Added `SandboxError`/`isSandboxError`, Docker image and sandbox management (`hasImage`, `ensureImage`, `listSandboxes`, `destroySandbox`), `execText`, `sandboxToolRecovery`, handle-accepting tool factories with default tools, hub connection events, `waitForConnection`, `attach`, `createRelayTicketStore`, `anvia-sandbox --from`/`--version`, and stricter daemon CLI flags with tunnel environment options. |
| `1.3.2` | Added `anvia-sandbox-daemon --check` and `--require`, desktop configuration from `ANVIA_SANDBOX_DESKTOP*` environment variables, `create-image --feature desktop`, and `studioSandbox`/`studioDesktopView` for Studio. Updated upstream runtime dependencies and the `zod` peer range. |
| `1.3.1` | Fixed the browser tunnel and desktop relays on runtimes whose WebSocket cannot pause, such as Bun; a browser more than 4 MiB ahead of the service is closed with code 1008 instead of growing memory. |
| `1.3.0` | Added the neutral `SandboxRuntime` and `createSandboxTools`; the remote runtime with `RemoteSandboxHub`, `SandboxDaemon`, and `operationId` deduplication; interactive terminals; loopback tunnels with binary framing; and the remote desktop with `createDesktopTools`. `DockerSandboxRuntime` now extends `SandboxRuntime`. |
| `1.2.0` | Natural command lines in `exec_command` and `start_process` use `/bin/bash -c` when Bash is available, falling back to `sh -c`; allow policies check the selected executable. |
| `1.1.8` | Refreshed the package README. |
| `1.1.7` | Redacted sandbox `env` values (`--env KEY=<redacted>`) in Docker command error messages. |
| `1.1.6` | Accepted natural shell command lines in `exec_command` (run as `sh -c`, rejected under block-mode policies), supported file listing in Alpine and other BusyBox images, and avoided false file-boundary errors from macOS temporary path aliases. |
| `1.1.5` | Fixed the package-manager-symlinked CLI entry point and accepted workspace-absolute paths inside the sandbox workdir in tool calls. |
| `1.1.4` | Updated upstream runtime and schema dependencies and aligned the browser image and Playwright host pins. |
| `1.1.3` | Block shell interpreters by default in allow-mode command policies, plus the peer-range fix. |
| `1.1.2` | Added containerRuntime option to DockerSandboxClient.createSandbox() for running sandboxes on gVisor (e.g. runsc); creation fails with runtime_not_found unless registered. |
| `1.1.1` | Bumped upstream runtime dependencies and aligned zod to 4.5.4 across packages. |
| `1.0.10` | Updated the Core dependency to `1.0.10`. |
| `1.0.9` | Updated the Core dependency to `1.0.9`. |
| `1.0.8` | Updated the Core dependency to `1.0.8`. |
| `1.0.7` | Updated the Core dependency to `1.0.7`. |
| `1.0.6` | Updated the Core dependency to `1.0.6`. |
| `1.0.5` | Updated the Core dependency to `1.0.5`. |
| `1.0.4` | Updated the Core dependency to `1.0.4`. |
| `1.0.3` | Updated the Core dependency to `1.0.3`. |
| `1.0.2` | Updated the Core dependency to `1.0.2`. |
| `1.0.1` | Updated the Core dependency to `1.0.1`. |
| `1.0.0` | Replaced implicit session-style lifecycle with explicit image pull, sandbox create/stop/resume/destroy handles; added resource, security, shared-memory, inspection, async-disposal, and browser-runtime support. Studio sandbox exposure is now explicit registration. |
| `1.0.0-rc.9` | Synchronized Sandbox with the Anvia 1.0 release-candidate train. |
| `0.6.0` | Added bounded line pagination to session and `read_file` APIs, including continuation metadata and safe default line/byte limits. |
| `0.5.0` | Added the interactive/scriptable `create-image` CLI for composed Node, Bun, Python, artifact, Playwright, apt, npm, and uv images. |
| `0.4.1` | Added automatic read-only Studio discovery for sandbox-backed agent workspaces. |
| `0.4.0` | Added loopback-only port publication, managed processes, readiness checks, and opt-in process/preview tools. |
| `0.3.7` | Simplified internal option construction without changing public behavior. |
| `0.3.6` | Widened the compatible Core peer range. |
| `0.3.5` | Moved Core to a peer dependency to avoid duplicate private-type incompatibilities. |
| `0.3.0` | Added persistent workspaces, lifecycle cleanup, streaming exec, file limits, hooks, language presets, and model-facing tool policies. |
| `0.2.0` | Introduced Docker-backed ephemeral workspaces. |

## Upgrade checks

- Confirm Node `>=20.12`, Docker CLI compatibility, daemon access, and the Core peer range.
- Migrate old session constructors and automatic Studio discovery to `DockerSandboxClient`, explicit sandbox handles, and `StudioOptions.sandboxes` registrations.
- Test path, size, timeout, process, and command policies against negative cases.
- When adopting paged reads, handle `nextStartLine` until it is `null` instead of assuming one call returns a whole file.
- Review generated image inputs and pin custom package versions needed for reproducibility.
- Re-test lifecycle cleanup and persistent volume retention before deploying a new version.

Read the complete [Sandbox changelog](https://github.com/anvia-hq/anvia/blob/main/packages/tool-sandbox/CHANGELOG.md).
