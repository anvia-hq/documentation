# Releases

Current release candidate: `1.0.0-rc.2`. The entries below preserve notable v0 history.

## Notable changes

| Version | Type | Summary |
| --- | --- | --- |
| `0.3.0` | Minor | Added Core sparse embedding contracts and FastEmbed SPLADE++ passage/query adapters for hybrid retrieval. |
| `0.2.12` | Patch | Simplified optional object construction without changing public behavior. |
| `0.2.11` | Patch | Refactored the entrypoint into focused internal modules while preserving the public barrel. |
| `0.2.10` | Patch | Moved Core to a peer dependency to prevent duplicate type identities. |
| `0.2.0` | Minor | Updated the package for Core’s reorganized public import surface. |

The full changelog also records releases that only track Core dependency updates or workspace layout changes.

- [Full `@anvia/fastembed` changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/embedding-fastembed/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/fastembed/api-reference)
