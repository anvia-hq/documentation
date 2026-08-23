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

`McpClientOptions` contains a stable `name`, one transport, and optional tool filtering or prefix
configuration. Construction is lazy. One connected client owns one remote transport.

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
