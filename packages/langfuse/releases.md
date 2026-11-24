# Releases

Reviewed source release: `1.3.0`. The entries below summarize recent v1 changes and preserve notable
v0 history.

## Changes through 1.3.0

Reviewed `1.2.2` → `1.3.0` against SDK source on 2026-11-04. `1.2.2` updated runtime dependencies. `1.3.0` moved to `@langfuse/otel` and `@langfuse/tracing` 6.x, `@anthropic-ai/sdk` 1.x, and `@mistralai/mistralai` 3.x, and raised the `zod` peer range to `^4.6.7`.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/e751560f4a02c8989928966c203ed8747c0072fb/packages/observability-langfuse/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

## Notable history

| Version | Change |
| --- | --- |
| `1.3.0` | Moved to `@langfuse/otel` and `@langfuse/tracing` 6.x with `@anthropic-ai/sdk` 1.x and `@mistralai/mistralai` 3.x; the `zod` peer range is now `^4.6.7`. |
| `1.2.2` | Updated runtime dependencies to the latest compatible minor and patch releases. |
| `1.2.0` | Moved the shared PII-redaction implementation to `@anvia/core/redaction`, retaining `createPiiRedactor()` as a re-export while improving card, phone, token, depth, and circular-reference handling. |
| `1.1.5` | Updated upstream runtime and schema dependencies across the workspace. |
| `1.1.4` | Rejected non-finite score values instead of serializing them as `null`. |
| `1.1.3` | Declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents. |
| `1.1.2` | Updated to the shared Core 1.1.2 contracts. |
| `1.1.1` | Bumped upstream runtime dependencies, aligned zod to 4.5.4 across workspaces, and updated to the shared Core 1.1.1 contracts. |
| `1.0.10` | Updated to the shared Core 1.0.10 contracts. |
| `1.0.9` | Added typed completion model controls with provider-neutral reasoning effort support, Agent defaults, per-run overrides, Studio selectors and persistence, and normalized observability attributes. |
| `1.0.8` | Updated to the shared Core 1.0.8 contracts. |
| `1.0.7` | Updated to the shared Core 1.0.7 contracts. |
| `1.0.6` | Updated to the shared Core 1.0.6 contracts. |
| `1.0.5` | Updated to the shared Core 1.0.5 contracts. |
| `1.0.4` | Updated to the shared Core 1.0.4 contracts. |
| `1.0.3` | Updated to the shared Core 1.0.3 contracts. |
| `1.0.2` | Added explicit cancelled-run reporting and graceful abort-before-close guidance. |
| `1.0.1` | Refreshed supported upstream SDK and runtime dependencies. |
| `0.6.1` | Published updated upstream runtime dependencies. |
| `0.6.0` | Added richer evaluation results, totals, usage, cost, and first-party CLI behavior. |
| `0.5.0` | Added trace-correlated evaluation scores and Langfuse experiment integration. |
| `0.4.0` | Added full nested tracing, safe capture, redaction, streaming deltas, and reliable score flushing. |
| `0.3.0` | Added environment configuration, dataset experiments, prompt management, PII helpers, score queues, and trace handles. |

Install a version compatible with the declared `@anvia/core` dependency range.

Read the [complete source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/observability-langfuse/CHANGELOG.md) for every patch and dependency-only release.
