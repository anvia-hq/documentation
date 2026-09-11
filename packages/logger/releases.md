# Releases

Current stable release: `1.1.3`. The entries below preserve notable v0 history.

## Notable history

| Version | Change |
| --- | --- |
| `1.1.3` | Declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents. |
| `1.1.2` | Updated the Core dependency to `1.1.2`. |
| `1.1.1` | Updated the Core dependency to `1.1.1`. |
| `1.0.10` | Updated the Core dependency to `1.0.10`. |
| `1.0.9` | Updated the Core dependency to `1.0.9`. |
| `1.0.8` | Updated the Core dependency to `1.0.8`. |
| `1.0.7` | Updated the Core dependency to `1.0.7`. |
| `1.0.6` | Updated the Core dependency to `1.0.6`. |
| `1.0.5` | Updated the Core dependency to `1.0.5`. |
| `1.0.4` | Updated the Core dependency to `1.0.4`. |
| `1.0.3` | Updated the Core dependency to `1.0.3`. |
| `1.0.2` | Reported cancelled Agent runs explicitly and drained active runs before observability providers shut down. |
| `1.0.1` | Updated the Core dependency to `1.0.1`. |
| `1.0.0` | Prepared the synchronized Anvia 1.0 release train and redesigned observability around named Agent observers with explicit primary trace provenance. |
| `0.3.11` | Simplified optional-object construction without changing public behavior. |
| `0.3.10` | Moved `@anvia/core` to a peer dependency to prevent duplicate private-type incompatibilities. |
| `0.3.0` | Aligned imports with the focused Core public entrypoints. |
| `0.2.0` | Introduced structured logger types, Console and Pino factories, and the agent observer. |

Install Anvia versions with compatible declared dependency ranges.

Read the [complete source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/logger/CHANGELOG.md) for every patch and dependency-only release.
