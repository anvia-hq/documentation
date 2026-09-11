# Releases

Current stable release: `1.1.3`. The entries below summarize recent v1 changes and preserve notable
v0 history.

## Notable history

| Version | Change |
| --- | --- |
| `1.1.3` | Declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents. |
| `1.1.2` | Updated to the shared Core 1.1.2 contracts. |
| `1.1.1` | Bumped upstream runtime dependencies, aligned zod to 4.5.4 across workspaces, and updated to the shared Core 1.1.1 contracts. |
| `1.0.11` | Updated to the shared Core 1.0.10 contracts. |
| `1.0.10` | Added typed completion model controls with provider-neutral reasoning effort support, Agent defaults, per-run overrides, Studio selectors and persistence, and normalized observability attributes. |
| `1.0.9` | Updated to the shared Core 1.0.8 contracts. |
| `1.0.8` | Updated to the shared Core 1.0.7 contracts. |
| `1.0.7` | Updated to the shared Core 1.0.6 contracts. |
| `1.0.6` | Added trace-correlated runtime scoring with explicit end-user feedback provenance, exposed through both the OpenTelemetry scorer and `LensClient.score()`. |
| `1.0.5` | Updated to the shared Core 1.0.5 contracts. |
| `1.0.4` | Added constructor-level named Pipeline observability with run and stage lifecycles, primary trace results, automatic parent propagation into Agent stages, and OpenTelemetry and Lens Pipeline observers exporting nested spans. |
| `1.0.3` | Updated to the shared Core 1.0.3 contracts. |
| `1.0.2` | Added explicit cancelled-run reporting and documented abort-before-provider-shutdown ordering. |
| `1.0.1` | Updated to Core 1.0.1. |
| `0.8.0` | Added request instructions to full-capture generation inputs, including streamed child agents. |
| `0.7.0` | Added richer evaluation totals, usage, cost, CLI results, and run-end behavior. |
| `0.6.0` | Added opt-in evaluation case payload capture. |
| `0.5.0` | Added evaluation run identity and lifecycle reporting. |
| `0.4.0` | Added safe bounded capture, richer attributes, run events, and stable evaluation identifiers. |
| `0.3.0` | Added correlated OpenTelemetry evaluation-result events. |

Install a version compatible with the declared `@anvia/core` dependency range.

Read the [complete source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/observability-otel/CHANGELOG.md) for patch-level and dependency-only releases.
