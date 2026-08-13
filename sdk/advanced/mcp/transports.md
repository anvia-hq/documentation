# HTTP and SSE

Use streamable HTTP or SSE when the MCP server runs remotely. Keep both transports behind a server-side application boundary.

## Choose a transport

| Transport | Use when |
| --- | --- |
| `mcp.stdio(...)` | The application starts and owns a local child process. |
| `mcp.http(...)` | The remote server supports streamable HTTP. |
| `mcp.sse(...)` | The remote server exposes the legacy SSE transport. |

Prefer the transport supported by the server. Application code receives the same connected `McpServer` shape after `connectMcp(...)`.

## Connect with HTTP

```ts
import { connectMcp, mcp } from '@anvia/core/mcp'

const crm = await connectMcp(
  mcp.http({
    name: 'crm',
    url: 'https://internal.example.com/mcp',
  }),
)
```

`mcp.http(...)` creates a lazy connection. Network access and tool discovery begin when `connectMcp(...)` runs.

## Connect with SSE

```ts
const events = await connectMcp(
  mcp.sse({
    name: 'events',
    url: 'https://internal.example.com/mcp/sse',
  }),
)
```

Both factories accept a `transport` option for supported configuration from the corresponding MCP
SDK client transport. A custom `transport.fetch` implementation is rejected because it could bypass
Anvia's outbound request protections.

## Remote URL safety

HTTP and SSE connections accept only `http:` and `https:` URLs. At connection time Anvia rejects
localhost, loopback, link-local, private, reserved, multicast, and cloud-metadata addresses. It
resolves and validates every hostname before connecting and pins the validated resolution through
the request dispatcher. The same checks apply to redirects and OAuth metadata requests.

This means `mcp.http(...)` and `mcp.sse(...)` are intended for remotely reachable servers. Use
`mcp.stdio(...)` for a local MCP process. If an internal remote server must be reachable, expose it
through an application-controlled gateway with an allowed public address rather than weakening the
transport boundary.

## Keep credentials server-side

Resolve credentials, service identity, network routing, and tenant scope before connecting. Never send privileged MCP credentials to a browser or let browser code connect directly to an internal MCP endpoint.

Avoid placing secrets in URLs because URLs commonly appear in logs and traces. Use the transport's supported authentication configuration or an application-controlled gateway.

## Scope remote connections deliberately

Use one shared connection when the server exposes the same reviewed tools and identity to every permitted request. Use request- or tenant-scoped connections when credentials or remote tool visibility differ by scope.

Whichever scope you choose must own `close()`. A shared server closes at application shutdown; a request or job connection closes in `finally`.

## Handle unavailable servers

Decide at startup whether an MCP dependency is required or optional. A required server may fail startup. An optional capability can be omitted from the agent's tool set while the application reports degraded status internally.

Do not silently expose a different fallback tool with broader permissions.
