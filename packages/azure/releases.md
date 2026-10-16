# Releases

Reviewed source release: `0.1.3`. `@anvia/azure` is a new package, so its release history starts here.

## HTTPS requirement in 0.1.3

Reviewed `0.1.3` against SDK source on 2026-10-16. Both `endpoint` and `baseUrl` now require HTTPS for non-loopback hosts. Plain `http://` is allowed only for loopback development hosts (`localhost`, `127.0.0.1`, or `[::1]`). Other HTTP URLs throw a `TypeError` during construction, preventing credentials from being sent over cleartext to remote hosts. Existing HTTPS configurations and local emulator URLs such as `http://127.0.0.1:10000` keep working.

See the [0.1.3 source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/provider-azure/CHANGELOG.md#013) and [upgrade guidance](/packages/azure/migration#upgrade-to-0-1-3).

## Changes through 0.1.1

Reviewed `0.1.0` → `0.1.1` against SDK source on 2026-10-15. Aligned the OpenAI dependency with the Decisions-capable release. Azure continues to expose its documented Responses completion adapter; this dependency update does not add an Azure decision factory.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/provider-azure/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

## Recent changes

| Version | Type | Summary |
| --- | --- | --- |
| `0.1.3` | Patch | Require HTTPS for non-loopback `endpoint` and `baseUrl` values; retain HTTP support for loopback development hosts. |
| `0.1.0` | Minor | Added `AzureOpenAIClient` for Azure OpenAI and Foundry v1 endpoints with API-key or Microsoft Entra token authentication, injected SDK clients, and Azure provider identities. Moved Azure Responses function-name recovery and the opt-in Azure integration test into the package, and added explicit message types to Azure Responses requests for Foundry project endpoints. Built on `@anvia/openai` `1.2.0`. |

## Related changes

- `@anvia/openai` `1.2.0` added the `@anvia/openai/adapters` export with request-mapping and stream-normalization extension points, and kept OpenAI's own parser responsible for native events, including unnamed argument events without a synthesized name.
- `@anvia/openai` `1.1.5` supported Azure AI Foundry Responses streams that omit the function name from the terminal tool-argument event. Use `AzureOpenAIClient` when you need Azure event normalization.
- `@anvia/core` `1.7.1` retains final-only Responses reasoning in streams, including Azure Responses streams.

- [Full `@anvia/azure` changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-azure/CHANGELOG.md)
- [OpenAI adapter changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-openai/CHANGELOG.md)
- [Compatibility and versioning](/packages/compatibility-and-versioning)
- [API reference](/packages/azure/api-reference)
