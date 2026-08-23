# Releases

`@anvia/mcp` enters the synchronized Anvia 1.0 release train in the next RC.

| Version | Summary |
| --- | --- |
| Next RC source | Extracted MCP connection ownership from Core and adopted the split official MCP TypeScript SDK v2 packages with required protocol `2026-07-28` and no legacy fallback. |

Applications upgrading from earlier RCs must install `@anvia/mcp`, change client imports from
`@anvia/core/mcp`, and verify that every remote server supports the required modern protocol. Core
continues to expose the lightweight MCP registration types consumed by `Agent`.

Read the [source changesets](https://github.com/anvia-hq/anvia/blob/staging/.changeset/extract-mcp-package.md)
and [`@anvia/mcp` package source](https://github.com/anvia-hq/anvia/tree/staging/packages/mcp).
