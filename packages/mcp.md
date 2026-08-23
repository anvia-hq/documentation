# `@anvia/mcp`

`@anvia/mcp` connects Anvia agents to Model Context Protocol servers. It owns stdio and
Streamable HTTP transports, paginated tool discovery, tool adaptation, result mapping, URL safety,
and connection cleanup. `@anvia/core` keeps only the lightweight registration contracts consumed by
`Agent`.

## Install

```sh
pnpm add @anvia/core@rc @anvia/mcp@rc
```

The package requires Node.js 20 or newer, the official split MCP TypeScript SDK v2, and MCP protocol
revision `2026-07-28`. There is no legacy handshake fallback.

## Connect a server

```ts
import { Agent } from '@anvia/core/agent'
import { McpClient } from '@anvia/mcp'

const client = new McpClient({
  name: 'filesystem',
  transport: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', './workspace'],
  },
})

const server = await client.connect()
const agent = new Agent({ id: 'assistant', model, mcpServers: [server] })

try {
  await agent.generate({ prompt: 'List the workspace files.' })
} finally {
  await client.close()
}
```

Construction performs no I/O. `connect()` negotiates the protocol, lists every tool page once, and
returns an immutable registration snapshot. Reconnect and rebuild the Agent to adopt a changed
remote tool catalog.

## Boundaries

- Keep clients, credentials, and continuations on the server.
- Keep Streamable HTTP SSRF protection strict for external or caller-influenced URLs.
- Disable SSRF protection only for a fixed, application-owned private endpoint.
- Allow-list privileged or changing remote tools before adding them to an Agent.
- Close every client at its owning application lifecycle boundary.

Continue with [Get started](/packages/mcp/get-started), [Capabilities](/packages/mcp/capabilities),
[API reference](/packages/mcp/api-reference), or the full [MCP guide](/sdk/advanced/mcp).
