# `@anvia/mcp` API reference

```ts
import {
  McpClient,
  McpClientGroup,
  isMcpTool,
  type McpClientOptions,
  type McpClientTransport,
  type McpServer,
  type McpTool,
} from '@anvia/mcp'
```

## Client

```ts
class McpClient {
  constructor(options: McpClientOptions)
  connect(options?: { abortSignal?: AbortSignal }): Promise<McpServer>
  close(): Promise<void>
}
```

`McpClientOptions` contains a stable `name`, one transport, optional `versionNegotiation`, and
optional tool filtering or prefix configuration. Construction is lazy. One connected client owns
one remote transport.

`versionNegotiation` is a client option, not a transport option. The default pins `2026-07-28`
without fallback. Use `mode: "auto"` to allow fallback, `mode: "legacy"` for the 2025-era
initialize handshake, or `{ mode: { pin: "2026-07-28" } }` to make the pin explicit.

## Client group

```ts
class McpClientGroup {
  static connect(options: {
    clients: readonly McpClient[]
    abortSignal?: AbortSignal
  }): Promise<McpClientGroup>

  readonly servers: readonly McpServer[]
  close(): Promise<void>
}
```

Group connection closes already-connected clients if a later client fails. Closing is explicit and
safe to call during application shutdown.

## Transports

`McpClientTransport` is a discriminated union:

- `stdio`: `command`, optional `args`, `cwd`, `env`, `stderr`, and buffer limits;
- `streamableHttp`: `url`, optional exact-endpoint `headers`, `authProvider`, session/reconnection
  settings, and `ssrfProtection`; or
- `custom`: an application-owned factory returning an MCP SDK v2 `Transport`.

Return to the [`@anvia/mcp` overview](/packages/mcp).
