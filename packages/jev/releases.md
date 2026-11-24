# Releases

Reviewed source release: `0.3.1`. This is the first functional release of `@anvia/jev`.

## Changes in 0.3.1

Reviewed `0.3.0` → `0.3.1` against SDK source on 2026-11-23. Split the decision modules and moved shared helpers to the internal `@anvia/core/internal/provider` subpath.

## Changes in 0.3.0

Reviewed `0.2.0` → `0.3.0` against SDK source on 2026-11-23. Aligns model IDs (including `JEV_PREVIEW`), context limits, and reasoning controls.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
| `0.3.1` | Patch | Split the decision modules and moved shared helpers to the internal `@anvia/core/internal/provider` subpath. |
| `0.2.0` | Minor | Added `@anvia/jev` on TypeSafe's official SDK, with mixed questions, multi-label composition, normalized usage, raw responses, model listing, and injected clients. Score responses validate the returned legend against the sent rubric criteria before normalization. Introduced provider-neutral typed decisions in `@anvia/core/decision` (choice, multiple labels, rubric scores, boolean probabilities, validated execution, and ordered batches with retries and cancellation), exported from the Core root as well. |

A `0.0.0-bootstrap.0` placeholder was published once to the `bootstrap` tag to establish the package on npm. It contains no adapter and should not be used in applications.

- [Full `@anvia/jev` changelog](https://github.com/anvia-hq/anvia/blob/7aa42c0a16c14cd96e42e503a2dd4c68a2ba9488/packages/provider-jev/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/jev/api-reference)
- [Typed decisions guide](/sdk/decisions)
