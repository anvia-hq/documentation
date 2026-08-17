# Releases

The current source manifest is `@anvia/sandbox` **1.0.0-rc.2**. The entries below preserve notable v0 history.

| Version | Summary |
| --- | --- |
| `1.0.0-rc.2` | Synchronized Sandbox with the Anvia 1.0 release-candidate train. |
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
- Test path, size, timeout, process, and command policies against negative cases.
- When adopting paged reads, handle `nextStartLine` until it is `null` instead of assuming one call returns a whole file.
- Review generated image inputs and pin custom package versions needed for reproducibility.
- Re-test lifecycle cleanup and persistent volume retention before deploying a new version.

Read the complete [Sandbox changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/tool-sandbox/CHANGELOG.md).
