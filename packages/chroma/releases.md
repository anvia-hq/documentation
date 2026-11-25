# Releases

Reviewed source release: `1.2.0`. The entries below preserve notable v0 history.

Reviewed `1.1.5` → `1.2.0` against SDK source on 2026-11-04. Added native `ne`, `in`, `gte`, and `lte` metadata filters and n-ary `and`/`or`; empty `in` lists and empty logical lists are rejected. See [search and filters](/packages/chroma/search-and-filters).

The available changelog records:

- `1.2.0` added native `ne`, `in`, `gte`, and `lte` filter translation and n-ary `and`/`or`.
- `1.1.5` refreshed the package README.
- `1.1.4` rejected reserved `__anvia_`-prefixed metadata keys during document upsert, validating metadata before the existing document is deleted.
- `1.1.3` declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents.
- `1.1.2` refreshed runtime dependencies alongside the Core 1.1.2 update.
- `1.1.1` refreshed runtime dependencies alongside the Core 1.1.1 update.
- `1.0.10` through `1.0.4` refreshed runtime dependencies alongside the Core 1.0.x updates.
- `0.2.12` simplified optional vector-query and result construction without changing behavior.
- `0.2.11` refreshed runtime dependencies.
- `0.2.10` moved `@anvia/core` to a peer dependency to avoid duplicate private-type incompatibilities.
- `0.2.6` recorded the repository's flattened package layout.
- `0.2.0` aligned imports with the focused core public surface.

Earlier visible entries are dependency updates. Read the complete [source changelog](https://github.com/anvia-hq/anvia/blob/2322fcd9b00e4cb82166c7aca319454ee97abe4e/packages/vector-chroma/CHANGELOG.md) for exact versions and hashes.

## Changes in 1.2.0

Reviewed `1.2.0` → `1.2.0` against SDK source on 2026-11-23. No source changes beyond dependency alignment in this review window.
