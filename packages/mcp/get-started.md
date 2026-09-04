# Get started

Install the MCP integration and Core from the same release channel:

```sh
pnpm add @anvia/core @anvia/mcp
```

Connect several independently owned clients with `McpClientGroup`:

```ts
import { Agent } from '@anvia/core/agent'
import { McpClient, McpClientGroup } from '@anvia/mcp'

const filesystem = new McpClient({
  name: 'filesystem',
  transport: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', './workspace'],
  },
})

const issues = new McpClient({
  name: 'issues',
  transport: {
    type: 'streamableHttp',
    url: 'https://mcp.example.com/mcp',
    headers: { authorization: `Bearer ${process.env.MCP_TOKEN}` },
  },
  tools: { prefix: 'issues_' },
})

const group = await McpClientGroup.connect({ clients: [filesystem, issues] })
const agent = new Agent({ id: 'operator', model, mcpServers: group.servers })

try {
  await agent.generate({ prompt: 'Inspect the repository and its open issues.' })
} finally {
  await group.close()
}
```

Each client pins MCP protocol `2026-07-28` by default. Set `versionNegotiation` on a client that
must talk to a 2025-era server.

Static HTTP headers are sent only to the exact endpoint, never to OAuth traffic, and an endpoint
redirect fails the request instead of forwarding credentials. A static `authorization` header cannot
be combined with `authProvider`.

For a trusted local or private-network HTTP server, set `ssrfProtection: 'disabled'`. Do not derive
that setting from user or model input. See [MCP transports](/sdk/advanced/mcp/transports) for the
complete boundary.
