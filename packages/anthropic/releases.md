# Releases

Current stable release: `1.1.3`. The entries below summarize the 1.0 line and preserve notable v0 history.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
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
| `0.5.1` | Patch | Published updated upstream runtime dependencies. |
| `0.5.0` | Minor | Added model-aware context limits and provider-reported active context usage. |
| `0.4.1` | Patch | Improved tracing capture, prompt metadata, usage normalization, and observability behavior. |
| `0.4.0` | Minor | Added the dedicated `AnthropicVertexClient` and first-class Google authentication options. |

## Earlier compatibility milestones

- `0.3.12` added autocomplete-friendly model-name types while retaining custom IDs.
- `0.3.9` moved Core to a peer dependency to prevent duplicate type identities.
- `0.3.7` reported streaming usage from Anthropic message start and delta events.
- `0.3.4` hardened non-OpenAI response validation and package-local build behavior.
- `0.2.0` added first-class multimodal tool-result support across the provider layer.
- `0.1.8` fixed Anthropic-compatible streaming tool inputs.

This is a selective operational summary, not a substitute for the source record.

- [Full `@anvia/anthropic` changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-anthropic/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/anthropic/api-reference)
