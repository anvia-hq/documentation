# MCP

Model Context Protocol connects Anvia agents to tools hosted by external servers.

Install the dedicated integration package alongside Core:

```sh
pnpm add @anvia/core @anvia/mcp
```

`@anvia/mcp` owns connections, transports, tool discovery, result mapping, and cleanup. Core keeps
only the lightweight server-registration contracts consumed by `Agent`.

```text
Application -> connect -> list tools -> review -> agent -> remote call
```

The application owns connection scope, credentials, the allowed tool set, product authorization, and cleanup. The MCP server owns its remote implementation and must validate every call.

## 1. Connect and run

```ts
import { Agent } from '@anvia/core'
import { McpClient } from '@anvia/mcp'

const client = new McpClient({
  name: 'docs-filesystem',
  transport: {
    type: 'stdio',
    command: 'npx',
    args: [
      '@modelcontextprotocol/server-filesystem',
      '/workspace/docs',
    ],
  },
})
const filesystem = await client.connect()

try {
  const agent = new Agent({
    id: 'docs-operator',
    model,
    instructions: 'Use filesystem tools only for documentation files.',
    mcpServers: [filesystem],
  })

  const response = await agent.generate({
      prompt: 'List the documentation files.'
  })

  if (response.type === 'response') {
    console.log(response.output)
  }
} finally {
  await client.close()
}
```

`client.connect()` connects, lists the server's tools, and adapts them into normal Anvia tools. `mcpServers` registers every adapted tool from that server.

Use `McpClientGroup` to connect several servers. `connect({ clients, abortSignal })` connects every client and closes the others when one fails; the returned group exposes `servers` for `mcpServers` and `close()` for cleanup:

```ts
const group = await McpClientGroup.connect({ clients: [docsClient, crmClient] })

try {
  const agent = new Agent({ id: 'docs-operator', model, mcpServers: group.servers })
} finally {
  await group.close()
}
```

Set `tools: { prefix: 'crm_' }` on a client to namespace its tool names, such as `crm_get_customer`. Duplicate tool names across servers fail agent construction.

The package uses the official split MCP TypeScript SDK v2. By default, `McpClient` pins protocol
revision `2026-07-28` with no fallback. A server that cannot negotiate that revision fails clearly.

To connect to a 2025-era server, set `versionNegotiation` on the client, not the transport:

```ts
const client = new McpClient({
  name: 'legacy-crm',
  transport: {
    type: 'streamableHttp',
    url: 'https://mcp.example.com/api',
  },
  versionNegotiation: { mode: 'auto' },
})
```

`mode: "auto"` allows protocol fallback. `mode: "legacy"` uses the 2025-era initialize handshake. Omit the option, or pin `{ mode: { pin: '2026-07-28' } }`, when every server already supports the modern revision.

## 2. Review external capability

For privileged or changing servers, review `server.tools` after connecting, then register only the reviewed subset. MCP tools must be registered through `mcpServers`; `Agent.tools` rejects them at construction. Filter the frozen snapshot and register the subset as a plain `{ name, tools }` object:

```ts
const allowed = new Set(['search_docs', 'read_doc'])
const reviewed = filesystem.tools.filter((tool) => allowed.has(tool.name))

const agent = new Agent({
  id: 'docs-assistant',
  model,
  mcpServers: [{ name: filesystem.name, tools: reviewed }],
})
```

An MCP connection does not grant product authorization. Keep credentials server-side, resolve user and tenant scope in application code, constrain broad file or command servers, and filter remote output before public transport.

## 3. Continue through the section

- [Connect and own a server](/sdk/advanced/mcp/connect)
- [Choose stdio or streamable HTTP](/sdk/advanced/mcp/transports)
- [Understand result mapping](/sdk/advanced/mcp/results)
- [Enforce trust boundaries](/sdk/advanced/mcp/security)
- [Combine MCP and local tools](/sdk/advanced/mcp/local-tools)
- [Observe MCP operations](/sdk/advanced/mcp/observability)
- [Review the MCP checklist](/sdk/advanced/mcp/checklist)
