# Releases

Current release candidate: `1.0.0-rc.2`. The entries below preserve notable v0 history.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
| `0.4.1` | Patch | Published updated upstream dependencies, including `@anvia/openai`. |
| `0.4.0` | Minor | Added model-aware context limits and provider-reported active context usage. |
| `0.3.1` | Patch | Improved tracing capture and usage normalization through the provider stack. |
| `0.3.0` | Minor | Added provider tools, normalized sources, batch TTS/STT, Grok 4.5 defaults, and documented image-ratio behavior. |
| `0.2.0` | Minor | Introduced the first-class Grok package for completion, image generation, and model listing. |

Many `0.2.x` patch releases track fixes inherited from the delegated OpenAI-compatible adapter, including streaming tools, reasoning history, usage on failures, and provider dependency updates. Check both changelogs when diagnosing compatibility behavior.

- [Full `@anvia/grok` changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-grok/CHANGELOG.md)
- [OpenAI adapter changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-openai/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/grok/api-reference)
