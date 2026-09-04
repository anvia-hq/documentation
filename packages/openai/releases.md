# Releases

Current stable release: `1.1.1`. The entries below summarize the 1.0 line and preserve notable v0 history.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
| `1.1.1` | Patch | Bumped upstream runtime dependencies to their latest versions, aligned zod to `4.5.4` across all packages and workspaces, and updated the Core dependency to `1.1.1`. |
| `1.0.10` | Patch | Updated the Core dependency to `1.0.10`. |
| `1.0.9` | Patch | Added typed completion model controls with provider-neutral reasoning effort support, Agent defaults, per-run overrides, Studio selectors and persistence, and normalized observability attributes. |
| `1.0.8` | Patch | Updated the Core dependency to `1.0.8`. |
| `1.0.7` | Patch | Updated the Core dependency to `1.0.7`. |
| `1.0.6` | Patch | Updated the Core dependency to `1.0.6`. |
| `1.0.5` | Patch | Declared and verified Bun 1.3.14 runtime compatibility across the OpenAI SDK transport and media paths, and stabilized structured tool-output branding across Core module instances. |
| `1.0.4` | Patch | Updated the Core dependency to `1.0.4`. |
| `1.0.3` | Patch | Updated the Core dependency to `1.0.3`. |
| `1.0.2` | Patch | Updated the Core dependency to `1.0.2`. |
| `1.0.1` | Patch | Refreshed upstream SDK and runtime dependencies to their latest supported releases. |
| `1.0.0` | Major | Prepared the synchronized Anvia 1.0 release train. |
| `0.5.1` | Patch | Published updated upstream runtime dependencies. |
| `0.5.0` | Minor | Added model-aware context limits and provider-reported active context usage across normalized completion results and streams. |
| `0.4.1` | Patch | Improved complete-input tracing, safe/full capture behavior, prompt metadata, usage normalization, and observability integration. |
| `0.4.0` | Minor | Added provider-executed tool contracts and normalized provider tool/citation events used by compatible Responses integrations. |

## Compatibility and correctness milestones

The `0.3.x` series contains several behaviorally important hardening changes:

- `0.3.25` emitted public streaming tool-call deltas by default.
- `0.3.23` stabilized compatible-provider reasoning stream identity.
- `0.3.22` retained authoritative usage on failed Responses streams when supplied.
- `0.3.21` rejected invalid streaming tool indices and incomplete terminal tool metadata.
- `0.3.20` rejected malformed JSON tool arguments.
- `0.3.16` preserved refusal text and terminal Responses failure states.
- `0.3.15` introduced autocomplete-friendly model name types while keeping custom IDs.
- `0.3.12` moved Core to a peer dependency to avoid duplicate private-type incompatibilities.
- `0.3.4` hardened embedding and image response validation.

These summaries are selective. Review the complete source history before upgrading across several versions.

- [Full `@anvia/openai` changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-openai/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/openai/api-reference)
