# Releases

Reviewed source release: `1.1.8`. The entries below summarize the 1.0 line and preserve notable v0 history.

## Changes through 1.1.7

Reviewed `1.1.4` → `1.1.7` against SDK source on 2026-10-15. Refreshed package guidance and updated upstream Google GenAI dependencies. Review the source changelog for the dependency versions crossed by your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/provider-gemini/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
| `1.1.4` | Patch | Updated upstream runtime and schema dependencies across the workspace. |
| `1.1.3` | Patch | Declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents. |
| `1.1.2` | Patch | Updated the Core dependency to `1.1.2`. |
| `1.1.1` | Patch | Bumped upstream runtime dependencies to their latest versions, aligned zod to `4.5.4` across all packages and workspaces, and updated the Core dependency to `1.1.1`. |
| `1.0.10` | Patch | Updated the Core dependency to `1.0.10`. |
| `1.0.9` | Patch | Added typed completion model controls with provider-neutral reasoning effort support, Agent defaults, per-run overrides, Studio selectors and persistence, and normalized observability attributes. |
| `1.0.8` | Patch | Updated the Core dependency to `1.0.8`. |
| `1.0.7` | Patch | Updated the Core dependency to `1.0.7`. |
| `1.0.6` | Patch | Updated the Core dependency to `1.0.6`. |
| `1.0.5` | Patch | Updated the Core dependency to `1.0.5`. |
| `1.0.4` | Patch | Updated the Core dependency to `1.0.4`. |
| `1.0.3` | Patch | Updated the Core dependency to `1.0.3`. |
| `1.0.2` | Patch | Updated the Core dependency to `1.0.2`. |
| `1.0.1` | Patch | Refreshed upstream SDK and runtime dependencies to their latest supported releases. |
| `1.0.0` | Major | Prepared the synchronized Anvia 1.0 release train. |
| `0.4.1` | Patch | Published updated upstream runtime dependencies. |
| `0.4.0` | Minor | Added model-aware context limits and provider-reported active context usage. |
| `0.3.1` | Patch | Improved safe/full tracing, prompt metadata, usage normalization, and observability behavior. |
| `0.3.0` | Minor | Added first-class Vertex authentication through `googleAuthOptions`. |

## Earlier compatibility milestones

- `0.2.14` emitted public tool-call deltas by default.
- `0.2.11` preserved tool-result names when restoring persisted UI messages.
- `0.2.10` introduced typed known model names while retaining custom IDs.
- `0.2.7` moved Core to a peer dependency.
- `0.2.3` hardened provider response validation.
- `0.1.10` added first-class multimodal tool-result support.

Review the source changelog when upgrading across several versions; dependency-only releases are included there even when they do not alter Anvia’s authored API.

- [Full `@anvia/gemini` changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-gemini/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/gemini/api-reference)
