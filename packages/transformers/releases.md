# Releases

Current documented package version: `0.2.11`.

## Notable changes

| Version | Type | Summary |
| --- | --- | --- |
| `0.2.11` | Patch | Refactored the package entrypoint into a public barrel with focused internal modules. |
| `0.2.10` | Patch | Moved Core to a peer dependency to prevent duplicate private-type incompatibilities. |
| `0.2.6` | Patch | Updated workspace layout metadata after packages moved under top-level `packages/*`. |
| `0.2.0` | Minor | Updated the adapter for Core’s reorganized public import surface. |

Other `0.2.x` releases primarily track compatible Core updates. Read the complete changelog when upgrading from an older Core version.

- [Full `@anvia/transformers` changelog](https://github.com/anvia-hq/anvia/blob/main/packages/embedding-transformers/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/transformers/api-reference)
