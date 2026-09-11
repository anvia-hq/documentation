# Releases

The current stable release is `@anvia/sandbox` **1.1.3**. The entries below preserve notable v0 history.

| Version | Summary |
| --- | --- |
| `1.1.3` | Block shell interpreters by default in allow-mode command policies, plus the peer-range fix. |
| `1.1.2` | Added containerRuntime option to DockerSandboxClient.createSandbox() for running sandboxes on gVisor (e.g. runsc); creation fails with runtime_not_found unless registered. |
| `1.1.1` | Bumped upstream runtime dependencies and aligned zod to 4.5.4 across packages. |
| `1.0.0` | Replaced implicit session-style lifecycle with explicit image pull, sandbox create/stop/resume/destroy handles; added resource, security, shared-memory, inspection, async-disposal, and browser-runtime support. Studio sandbox exposure is now explicit registration. |
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
