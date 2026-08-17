# Releases

Current release candidate: `1.0.0-rc.2`. The entries below preserve notable v0 history.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
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

- [Full `@anvia/gemini` changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-gemini/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/gemini/api-reference)
