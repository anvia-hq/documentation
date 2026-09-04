# Releases

The current stable release is `@anvia/mcp` **1.1.0**.

| Version | Summary |
| --- | --- |
| `1.0.11` | Updated the Core dependency to `1.0.10`. |
| `1.0.10` | Allow `versionNegotiation` on `McpClient` so applications can connect to 2025-era servers with `mode: "auto"` or `mode: "legacy"`. The default remains a strict `2026-07-28` pin with no fallback. |
| `1.0.9` | Updated the Core dependency to `1.0.9`. |
| `1.0.8` | Updated the Core dependency to `1.0.8`. |
| `1.0.7` | Updated the Core dependency to `1.0.7`. |
| `1.0.6` | Updated the Core dependency to `1.0.6`. |
| `1.0.5` | Declared and verified Bun 1.3.14 runtime compatibility for MCP HTTP/SSE and stdio transports. |
| `1.0.4` | Updated the Core dependency to `1.0.4`. |
| `1.0.3` | Updated the Core dependency to `1.0.3`. |
| `1.0.2` | Updated the Core dependency to `1.0.2`. |
| `1.0.1` | Updated the Core dependency to `1.0.1`. |
| `1.0.0` | Extracted MCP connection ownership from Core and adopted the split official MCP TypeScript SDK v2 packages with required protocol `2026-07-28` and no legacy fallback. |

Applications upgrading from earlier RCs must install `@anvia/mcp` and change client imports from
`@anvia/core/mcp`. The default still pins protocol `2026-07-28`. Configure `versionNegotiation` on
`McpClient` when a 2025-era server needs `mode: "auto"` or `mode: "legacy"`. Core continues to
expose the lightweight MCP registration types consumed by `Agent`.

Read the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/mcp/CHANGELOG.md)
and [`@anvia/mcp` package source](https://github.com/anvia-hq/anvia/tree/main/packages/mcp).
