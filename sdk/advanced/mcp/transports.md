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
    headers: {
      Authorization: `Bearer ${process.env.MCP_TOKEN}`,
      'X-Workspace-Id': config.workspaceId,
    },
  },
})

const server = await client.connect()
```

The HTTP transport also accepts an MCP SDK `authProvider`, `reconnectionOptions`, and `sessionId`. The RC transport union contains only `stdio`, `streamableHttp`, and `custom` variants.

### Configure static endpoint headers

`headers` must be a plain object whose values are strings. These configured headers are added only to requests whose URL exactly matches the MCP endpoint. They are not attached to OAuth discovery, authorization, or token requests. Endpoint redirects fail instead of forwarding configured credentials to another URL.

The transport owns its HTTP method, body, abort signal, session state, and protocol fields. For that reason, Streamable HTTP does not expose arbitrary `RequestInit`, and configured headers cannot replace:

- `Accept`
- `Content-Type`
- `Last-Event-ID`
- `MCP-Protocol-Version`
- `MCP-Session-ID`

Header names are checked case-insensitively. A static `Authorization` header cannot be combined with `authProvider`; use exactly one authentication mechanism. If a value must change per request or requires a different scope, create a reviewed `custom` transport and own that complete security boundary.

### Connect to a trusted local or private server

Streamable HTTP uses strict SSRF protection by default. That mode rejects loopback, private-network, link-local, and cloud-metadata destinations and applies the same checks to DNS resolution, redirects, and OAuth discovery.

For an intentionally local MCP server, opt out explicitly:

```ts
import { McpClient } from '@anvia/core/mcp'

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
