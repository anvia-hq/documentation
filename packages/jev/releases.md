# Releases

Reviewed source release: `0.2.1`. `0.2.0` was the first functional release of `@anvia/jev`; `0.2.1` refreshes upstream dependencies and raises the `zod` peer range to `^4.6.7`.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
| `0.2.1` | Patch | Updated upstream runtime dependencies; the `zod` peer range is now `^4.6.7`, and `@typesafe-ai/sdk` 0.7 no longer accepts a `null` state. |
| `0.2.0` | Minor | Added `@anvia/jev` on TypeSafe's official SDK, with mixed questions, multi-label composition, normalized usage, raw responses, model listing, and injected clients. Score responses validate the returned legend against the sent rubric criteria before normalization. Introduced provider-neutral typed decisions in `@anvia/core/decision` (choice, multiple labels, rubric scores, boolean probabilities, validated execution, and ordered batches with retries and cancellation), exported from the Core root as well. |

A `0.0.0-bootstrap.0` placeholder was published once to the `bootstrap` tag to establish the package on npm. It contains no adapter and should not be used in applications.

- [Full `@anvia/jev` changelog](https://github.com/anvia-hq/anvia/blob/e751560f4a02c8989928966c203ed8747c0072fb/packages/provider-jev/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/jev/api-reference)
- [Typed decisions guide](/sdk/decisions)
