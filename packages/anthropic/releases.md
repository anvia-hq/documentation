# Releases

Reviewed source release: `1.4.3`. The entries below summarize the 1.0 line and preserve notable v0 history.

## Changes in 1.4.3

Reviewed `1.4.2` → `1.4.3` against SDK source on 2026-11-28. `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`, `claude-fable-5-1`, `claude-fable-5-2`, `claude-mythos-5-1`, and `claude-mythos-5-2`, including their `-`-suffixed IDs, declare `capabilities.forcedToolChoice: false`. A request or Agent that sets `toolChoice: 'required'` or a named tool on those models fails with `CompletionCapabilityError` before the provider call; `extract()` and evaluation judges send `'auto'` instead (`@anvia/core` 1.25.0+). Other models are unchanged. See [model options](/sdk/providers/anthropic/model-options).

## Changes in 1.4.2

Reviewed `1.4.1` → `1.4.2` against SDK source on 2026-11-28. `AnthropicCompletionModel` declares `capabilities.temperature: false` and no longer serializes the normalized `temperature` field, so a request or Agent that sets `temperature` fails with `CompletionCapabilityError` before the provider call. The rejection comes from the capability check added in `@anvia/core` 1.24.1; with an older Core the field is silently dropped instead. See [model options](/sdk/providers/anthropic/model-options).

## Changes in 1.4.1

Reviewed `1.4.0` → `1.4.1` against SDK source on 2026-11-23. Moved shared provider utilities to the internal `@anvia/core/internal/provider` subpath, split monolithic completion and decision modules, and guards against non-object provider responses in the embedding, image, and transcription adapters.

## Changes in 1.4.0

Reviewed `1.1.8` → `1.4.0` against SDK source on 2026-11-23. Adds prompt caching, aligns model IDs and reasoning controls with the current Claude line, accepts empty argument deltas for zero-argument tools, and fixes cross-provider conversation continuation.

## Changes through 1.1.7

Reviewed `1.1.4` → `1.1.7` against SDK source on 2026-10-15. Refreshed package guidance and updated upstream Anthropic and Vertex SDK dependencies. Review the source changelog for the dependency versions crossed by your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/386b66ba97225f6378d57c586e0f75173d3efc8d/packages/provider-anthropic/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
| `1.4.3` | Patch | Claude Opus, Sonnet, and Haiku 5.5 and Fable and Mythos 5.1+ declare `forcedToolChoice: false`; forced tool choice is rejected and `extract()` falls back to `'auto'`. |
| `1.4.2` | Patch | Declared `temperature: false`; the normalized `temperature` field is rejected with `CompletionCapabilityError` and never serialized. |
| `1.4.1` | Patch | Moved shared provider utilities to the internal `@anvia/core/internal/provider` subpath, split monolithic completion and decision modules, and guards against non-object provider responses in the embedding, image, and transcription adapters. |
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
