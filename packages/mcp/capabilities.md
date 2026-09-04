# Capabilities

| Capability | Behavior |
| --- | --- |
| Protocol | Pins MCP `2026-07-28` by default; `versionNegotiation` on `McpClient` can enable auto fallback or the legacy handshake |
| SDK | Official split MCP TypeScript SDK v2 packages |
| Transports | `stdio`, `streamableHttp`, and caller-owned `custom` |
| Discovery | Complete paginated tool listing at connection time |
| Registration | Immutable `McpServer` snapshots for `Agent.mcpServers` |
| Results | Text maps to text, image to a file content part, embedded resources to serialized text; `audio` and `resource_link` content are rejected. `structuredContent` is a fallback serialized as text only when `content` is empty |
| URL safety | Strict public-network validation by default for Streamable HTTP |
| Credentials | Exact-endpoint string headers or an MCP OAuth provider |
| Lifecycle | Lazy construction with explicit `connect()` and `close()` |

On Streamable HTTP the transport owns `accept`, `content-type`, `last-event-id`, `mcp-method`,
`mcp-name`, `mcp-protocol-version`, and `mcp-session-id`, plus every `mcp-param-` prefixed header;
configuring one throws a `TypeError`.

The package does not persist credentials, refresh remote tool catalogs automatically, authorize
product users, or make a remote server trustworthy. Those remain application and server
responsibilities.
