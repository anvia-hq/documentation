# MCP transports

RC supports application-owned stdio processes and remote streamable HTTP servers. Keep both behind the server-side application boundary.

## Local stdio

```ts
import { McpClient } from '@anvia/core/mcp'

const client = new McpClient({
  name: 'docs-filesystem',
  transport: {
    type: 'stdio',
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem', '/workspace/docs'],
  },
})

const server = await client.connect()
```

The stdio transport also accepts `env`, `cwd`, `stderr`, and `maxBufferSize`.

## Streamable HTTP

```ts
const client = new McpClient({
  name: 'customer-crm',
  transport: {
    type: 'streamableHttp',
    url: 'https://mcp.example.com/api',
    requestInit: {
      headers: { Authorization: `Bearer ${process.env.MCP_TOKEN}` },
    },
  },
})

const server = await client.connect()
```

The HTTP transport also accepts an MCP SDK `authProvider`, `reconnectionOptions`, and `sessionId`. The RC API does not expose a legacy SSE transport.

## Custom transport

For an application-controlled transport, return an MCP SDK `Transport` from a custom factory:

```ts
const client = new McpClient({
  name: 'custom-server',
  transport: {
    type: 'custom',
    create: async ({ abortSignal }) => createReviewedTransport({ abortSignal }),
  },
})
```

Custom transports bypass the built-in remote URL validation, so the application must enforce its own network and credential policy.

## Lifecycle and safety

Keep credentials, service identity, network routing, and tenant scope on the server. Share one client only when every permitted request uses the same identity and reviewed tools. Close the owning `McpClient` during shutdown or in `finally` for request-scoped connections.

Next, understand [result mapping](/sdk/advanced/mcp/results).
