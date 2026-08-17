# Releases

Current release candidate: `1.0.0-rc.2`. The entries below preserve notable v0 history.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
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

- [Full `@anvia/openai` changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-openai/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/openai/api-reference)
