# MCP

MCP connects Anvia agents to tools hosted by external Model Context Protocol servers. Anvia connects to the server, lists its tools, adapts them to normal runtime tools, and manages them through the same agent loop.

## Explore MCP

| Page | Learn how to |
| --- | --- |
| [Connect a server](/sdk/advanced/mcp/connect) | Connect through stdio and own the server lifecycle. |
| [HTTP and SSE](/sdk/advanced/mcp/transports) | Connect to remote MCP servers. |
| [Result mapping](/sdk/advanced/mcp/results) | Understand how MCP content becomes Anvia tool output. |
| [Trust boundaries](/sdk/advanced/mcp/security) | Review tools, enforce permissions, and filter results. |
| [Local tools](/sdk/advanced/mcp/local-tools) | Combine external capabilities with app-owned actions. |
| [Observability](/sdk/advanced/mcp/observability) | Trace MCP tools and connection failures. |
| [MCP checklist](/sdk/advanced/mcp/checklist) | Verify lifecycle, safety, and failure handling. |

## The connection flow

```text
Application → MCP connection → list tools → review tools → agent → call server
```

The application owns the connection, credentials, allowed tool set, user and tenant scope, and cleanup. The MCP server owns its remote implementation and must enforce its own permissions.

## Connect and run

```ts
import { AgentBuilder } from '@anvia/core'
import { connectMcp, mcp } from '@anvia/core/mcp'

const filesystem = await connectMcp(
  mcp.stdio({
    name: 'filesystem',
    command: 'npx',
    args: [
      '@modelcontextprotocol/server-filesystem',
      '/workspace/docs',
    ],
  }),
)

try {
  const agent = new AgentBuilder('docs-operator', model)
    .instructions('Use filesystem tools only for documentation files.')
    .mcp([filesystem])
    .build()

  const response = await agent
    .prompt('List the documentation files.')
    .send()

  console.log(response.output)
} finally {
  await filesystem.close()
}
```

`.mcp([filesystem])` exposes all adapted tools from that connected server. For privileged or changing servers, review and allow-list `filesystem.tools` before adding them with `.tools(...)`.

## Treat MCP as external capability

An MCP connection does not grant product authorization. Keep credentials server-side, resolve tenant scope in application code, constrain broad file or command servers, and filter remote output before it reaches a user.
