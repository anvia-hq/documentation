# Releases

Current stable release: `1.1.1`. The entries below summarize the 1.0 line and preserve notable v0 history.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
| `1.1.1` | Patch | Bumped upstream runtime dependencies to their latest versions, aligned zod to `4.5.4` across all packages and workspaces, and updated Core and OpenAI adapter dependencies to `1.1.1`. |
| `1.0.10` | Patch | Updated Core and OpenAI adapter dependencies to `1.0.10`. |
| `1.0.9` | Patch | Added typed completion model controls with provider-neutral reasoning effort support, Agent defaults, per-run overrides, Studio selectors and persistence, and normalized observability attributes. |
| `1.0.8` | Patch | Updated Core and OpenAI adapter dependencies to `1.0.8`. |
| `1.0.7` | Patch | Updated Core and OpenAI adapter dependencies to `1.0.7`. |
| `1.0.6` | Patch | Updated Core and OpenAI adapter dependencies to `1.0.6`. |
| `1.0.5` | Patch | Updated Core and OpenAI adapter dependencies to `1.0.5`. |
| `1.0.4` | Patch | Updated Core and OpenAI adapter dependencies to `1.0.4`. |
| `1.0.3` | Patch | Updated Core and OpenAI adapter dependencies to `1.0.3`. |
| `1.0.2` | Patch | Updated Core and OpenAI adapter dependencies to `1.0.2`. |
| `1.0.1` | Patch | Refreshed upstream SDK and runtime dependencies to their latest supported releases and updated the OpenAI adapter to `1.0.1`. |
| `1.0.0` | Major | Prepared the synchronized Anvia 1.0 release train. |
| `0.4.1` | Patch | Published updated upstream dependencies, including `@anvia/openai`. |
| `0.4.0` | Minor | Added model-aware context limits and provider-reported active context usage. |
| `0.3.1` | Patch | Improved tracing capture and usage normalization through the provider stack. |
| `0.3.0` | Minor | Added provider tools, normalized sources, batch TTS/STT, Grok 4.5 defaults, and documented image-ratio behavior. |
| `0.2.0` | Minor | Introduced the first-class Grok package for completion, image generation, and model listing. |

Many `0.2.x` patch releases track fixes inherited from the delegated OpenAI-compatible adapter, including streaming tools, reasoning history, usage on failures, and provider dependency updates. Check both changelogs when diagnosing compatibility behavior.

- [Full `@anvia/grok` changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-grok/CHANGELOG.md)
- [OpenAI adapter changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-openai/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/grok/api-reference)
