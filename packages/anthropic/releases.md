# Releases

Current documented package version: `0.5.1`.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
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
