# Releases

Reviewed source release: `1.1.5`. The entries below preserve notable v0 history.

## Changes through 1.1.5

Reviewed `1.1.3` → `1.1.5` against SDK source on 2026-10-15. Refreshed package guidance and updated Transformers.js dependencies. Review model and runtime compatibility when upgrading the local embedding stack.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/6664e5df6cfa82c9d8898c2ca2cfba59b2ec0679/packages/embedding-transformers/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

## Notable changes

| Version | Type | Summary |
| --- | --- | --- |
| `1.1.3` | Patch | Declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents. |
| `1.1.2` | Patch | Updated the Core dependency to `1.1.2`. |
| `1.1.1` | Patch | Updated the Core dependency to `1.1.1`. |
| `1.0.10` | Patch | Updated the Core dependency to `1.0.10`. |
| `1.0.9` | Patch | Updated the Core dependency to `1.0.9`. |
| `1.0.8` | Patch | Updated the Core dependency to `1.0.8`. |
| `1.0.7` | Patch | Updated the Core dependency to `1.0.7`. |
| `1.0.6` | Patch | Updated the Core dependency to `1.0.6`. |
| `1.0.5` | Patch | Updated the Core dependency to `1.0.5`. |
| `1.0.4` | Patch | Updated the Core dependency to `1.0.4`. |
| `0.2.11` | Patch | Refactored the package entrypoint into a public barrel with focused internal modules. |
| `0.2.10` | Patch | Moved Core to a peer dependency to prevent duplicate private-type incompatibilities. |
| `0.2.6` | Patch | Updated workspace layout metadata after packages moved under top-level `packages/*`. |
| `0.2.0` | Minor | Updated the adapter for Core’s reorganized public import surface. |

Other `0.2.x` releases primarily track compatible Core updates. Read the complete changelog when upgrading from an older Core version.

- [Full `@anvia/transformers` changelog](https://github.com/anvia-hq/anvia/blob/main/packages/embedding-transformers/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/transformers/api-reference)
