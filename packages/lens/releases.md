# Releases

Current stable release: `1.1.1`. The entries below summarize recent v1 changes and preserve notable
v0 history.

## Notable history

| Version | Change |
| --- | --- |
| `1.1.1` | Bumped upstream runtime dependencies, aligned zod to 4.5.4 across workspaces, and updated to the shared Core and OpenTelemetry 1.1.1 contracts. |
| `1.0.11` | Updated to the shared Core 1.0.10 and OpenTelemetry 1.0.11 contracts. |
| `1.0.10` | Added typed completion model controls with provider-neutral reasoning effort support, Agent defaults, per-run overrides, Studio selectors and persistence, and normalized observability attributes. |
| `1.0.9` | Updated to the shared Core 1.0.8 and OpenTelemetry 1.0.9 contracts. |
| `1.0.8` | Updated to the shared Core 1.0.7 and OpenTelemetry 1.0.8 contracts. |
| `1.0.7` | Updated to the shared Core 1.0.6 and OpenTelemetry 1.0.7 contracts. |
| `1.0.6` | Added trace-correlated runtime scoring with explicit end-user feedback provenance, exposed through both the OpenTelemetry scorer and `LensClient.score()`. |
| `1.0.5` | Updated to the shared Core 1.0.5 and OpenTelemetry 1.0.5 contracts. |
| `1.0.4` | Added constructor-level named Pipeline observability with run and stage lifecycles, primary trace results, automatic parent propagation into Agent stages, and OpenTelemetry and Lens Pipeline observers exporting nested spans. |
| `1.0.3` | Updated to the shared Core and OpenTelemetry 1.0.3 contracts. |
| `1.0.2` | Adopted explicit cancelled-run reporting from Core and OpenTelemetry. |
| `1.0.1` | Refreshed supported upstream dependencies. |
| `0.5.2` | Updated to the OpenTelemetry adapter that captures request instructions in full generation inputs. |
| `0.5.0` | Added richer evaluation results, optional environment setup, bundled eval integration, and run-end flushing. |
| `0.4.0` | Added authenticated reads for immutable managed-dataset versions with automatic pagination. |
| `0.3.0` | Added opt-in evaluation case payload capture with inherited redaction and size limits. |
| `0.2.0` | Added evaluation run identity and lifecycle reporting. |
| `0.1.0` | Introduced native Lens tracing and correlated evaluation reporting. |

Install versions compatible with the declared `@anvia/core` and `@anvia/otel` dependency ranges.

Read the [complete source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/observability-lens/CHANGELOG.md) for every release.
