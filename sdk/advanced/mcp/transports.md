# MCP transports

Anvia v1 supports application-owned stdio processes, remote Streamable HTTP servers, and
application-controlled custom transports through `@anvia/mcp`. Keep every transport behind the
server-side application boundary.

## Local stdio

```ts
import { McpClient } from '@anvia/mcp'

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
    headers: {
      Authorization: `Bearer ${process.env.MCP_TOKEN}`,
      'X-Workspace-Id': config.workspaceId,
    },
  },
})

const server = await client.connect()
```

The HTTP transport also accepts an MCP SDK `authProvider`, `reconnectionOptions`, `sessionId`, and `maxBufferSize`. The transport union contains only `stdio`, `streamableHttp`, and `custom` variants.

Protocol version is configured on `McpClient` through `versionNegotiation`, not on the transport. The default pins `2026-07-28` without fallback. Use `mode: "auto"` or `mode: "legacy"` on the client when a 2025-era server needs it.

### Bound response size

`maxBufferSize` caps each JSON-RPC response message from a Streamable HTTP server so an untrusted server cannot stream unbounded data into your process. It must be a positive safe integer of bytes and defaults to 10 MiB, matching the stdio default. For a regular JSON response, the cap applies to the whole body (an oversized `Content-Length` is rejected before reading). For an SSE (`text/event-stream`) response, it applies to each event, so long-lived streams made of many small messages keep flowing. An oversized message fails with `MCP response exceeded maxBufferSize (<n> bytes per message)`. The bound applies in both `ssrfProtection` modes; `custom` transports remain caller-owned.

```ts
const client = new McpClient({
  name: 'reports',
  transport: {
    type: 'streamableHttp',
    url: 'https://mcp.example.com/api',
    maxBufferSize: 2 * 1024 * 1024,
  },
})
```

### Configure static endpoint headers

`headers` must be a plain object whose values are strings. These configured headers are added only to requests whose URL exactly matches the MCP endpoint. They are not attached to OAuth discovery, authorization, or token requests. Endpoint redirects fail instead of forwarding configured credentials to another URL.

The transport owns its HTTP method, body, abort signal, session state, and protocol fields. For that reason, Streamable HTTP does not expose arbitrary `RequestInit`, and configured headers cannot replace:

- `Accept`
- `Content-Type`
- `Last-Event-ID`
- `MCP-Method`
- `MCP-Name`
- `MCP-Protocol-Version`
- `MCP-Session-ID`

Header names are checked case-insensitively, and names beginning with `mcp-param-` are also owned by the transport. A static `Authorization` header cannot be combined with `authProvider`; use exactly one authentication mechanism. If a value must change per request or requires a different scope, create a reviewed `custom` transport and own that complete security boundary.

### Connect to a trusted local or private server

Streamable HTTP uses strict SSRF protection by default. That mode rejects loopback, private-network, link-local, and cloud-metadata destinations and applies the same checks to DNS resolution, redirects, and OAuth discovery.

For an intentionally local MCP server, opt out explicitly:

```ts
import { McpClient } from '@anvia/mcp'

const client = new McpClient({
  name: 'local',
  transport: {
    type: 'streamableHttp',
    url: 'http://localhost:3000/mcp',
    ssrfProtection: 'disabled',
  },
})
```

`ssrfProtection` is `'strict' | 'disabled'` and defaults to `'strict'`. Disabling it removes Anvia's hostname and DNS restrictions for the complete MCP transport, including redirects and OAuth discovery; the URL must still use HTTP or HTTPS. Use this only when the application owns and trusts the network boundary. Never derive this option from user input or disable it merely to make an untrusted URL connect.

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
