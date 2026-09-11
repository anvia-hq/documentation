# Releases

Current stable release: `1.1.3`. The entries below summarize the 1.0 line and preserve notable v0 history.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
| `1.1.3` | Patch | Declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents. |
| `1.1.2` | Patch | Updated the Core dependency to `1.1.2`. |
| `1.1.1` | Patch | Updated the Core dependency to `1.1.1`. |
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
| `0.3.8` | Patch | Improved tracing capture and normalized cache/reasoning-aware usage. |
| `0.3.7` | Patch | Hardened tool-call JSON, deterministic missing IDs, tool-result names, and protected request fields. |
| `0.3.0` | Minor | Added the OCR adapter with URL, file-ID, image, and byte-upload sources. |

## Earlier compatibility milestones

- `0.3.2` added known model-name types with custom ID support.
- `0.2.11` moved Core to peer dependencies.
- `0.2.4` hardened non-OpenAI response validation.
- `0.2.0` reorganized Core’s public import surface used by integrations.
- `0.1.5` added first-class multimodal tool-result support in the provider layer.

These are selected behavior changes. Dependency-only and workspace metadata releases remain in the complete record.

- [Full `@anvia/mistral` changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-mistral/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/mistral/api-reference)
