# Releases

Current documented package version: `0.4.1`.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
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
