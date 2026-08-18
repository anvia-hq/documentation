# MCP

Model Context Protocol connects Anvia agents to tools hosted by external servers.

```text
Application -> connect -> list tools -> review -> agent -> remote call
```

The application owns connection scope, credentials, the allowed tool set, product authorization, and cleanup. The MCP server owns its remote implementation and must validate every call.

## 1. Connect and run

```ts
import { Agent } from '@anvia/core'
import { McpClient } from '@anvia/core/mcp'

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

  if (response.status === 'completed') {
    console.log(response.output)
  }
} finally {
  await client.close()
}
```

`client.connect()` connects, lists the server's tools, and adapts them into normal Anvia tools. `mcpServers` registers every adapted tool from that server.

## 2. Review external capability

For privileged or changing servers, allow-list `server.tools` and pass only the reviewed subset through `tools`.

An MCP connection does not grant product authorization. Keep credentials server-side, resolve user and tenant scope in application code, constrain broad file or command servers, and filter remote output before public transport.

## 3. Continue through the section

- [Connect and own a server](/sdk/advanced/mcp/connect)
- [Choose stdio or streamable HTTP](/sdk/advanced/mcp/transports)
- [Understand result mapping](/sdk/advanced/mcp/results)
- [Enforce trust boundaries](/sdk/advanced/mcp/security)
- [Combine MCP and local tools](/sdk/advanced/mcp/local-tools)
- [Observe MCP operations](/sdk/advanced/mcp/observability)
- [Review the MCP checklist](/sdk/advanced/mcp/checklist)
