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
optional tool prefix and discovery-budget configuration. Construction is lazy. One connected client owns
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
  settings, `ssrfProtection`, and `maxBufferSize` (per-message response bound in bytes, default
  10 MiB, applied to each JSON body or SSE event); or
- `custom`: an application-owned factory returning an MCP SDK v2 `Transport`.

Return to the [`@anvia/mcp` overview](/packages/mcp).

## Discovery budgets and session cleanup

`McpClientOptions.tools` accepts `prefix?: string` and optional
`discoveryLimits: { maxTools: number; maxBytes: number }`. Both limits are positive safe integers;
omitting them leaves discovery unbounded. Limits accumulate across pages before SDK aggregation.
`maxBytes` counts UTF-8 `JSON.stringify(page.tools)` bytes, including each page's array syntax.
The first over-budget page rejects discovery without fetching later pages; a retry starts a fresh budget.
These limits differ from transport `maxBufferSize`, which bounds each response message.

Streamable HTTP transport accepts `terminateSessionOnClose?: boolean` (default `false`). When enabled,
closing makes a best-effort legacy session DELETE bounded to two seconds, including cleanup after
failed initialization or cancellation. Persistent sessions keep their prior behavior by default.
Cancellation during protocol negotiation also closes retained transports.
