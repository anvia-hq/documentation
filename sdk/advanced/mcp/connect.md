# Connect a server

Use `connectMcp(...)` with an MCP connection factory. The returned server contains adapted tools and owns the connected client lifecycle.

## Connect through stdio

Use stdio for a local MCP process launched by the application:

```ts
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
```

The connection is lazy until `connectMcp(...)` runs. That call starts the process, connects the client, lists the available MCP tools, and adapts them into Anvia tools.

## Inspect the connected server

```ts
console.log(filesystem.name)
console.log(filesystem.tools.length)
```

The returned `McpServer` has:

| Member | Purpose |
| --- | --- |
| `name` | Stable server identity supplied in the connection options. |
| `tools` | MCP definitions adapted into runnable Anvia tools. |
| `close()` | Closes the underlying MCP client or local process. |

Connection and tool-listing failures reject from `connectMcp(...)`. Do not build the agent until the connection succeeds or the application has chosen a degraded tool set.

## Register the server

```ts
const agent = new Agent({
  id: 'docs-operator',
  model: model,
  mcpServers: [filesystem],
})
```

This registers every tool exposed by the server. Use an allow-listed subset through `.tools(...)` when the server exposes capabilities the agent should not receive.

## Close short-lived connections

Jobs, scripts, and tests should close the server in `finally`:

```ts
const server = await connectMcp(connection)

try {
  return await createAgent(server)
    .prompt(message)
    .send()
} finally {
  await server.close()
}
```

Closing only on success leaks a child process or remote transport when the prompt fails.

## Own long-running lifecycle at startup

Long-running servers should connect once during application startup, reuse the connected `McpServer`, and close it during application shutdown. Do not connect and list tools for every user message unless the server is intentionally request-scoped.

Keep the lifecycle owner beside the application bootstrap so a deploy, worker stop, or startup failure has one cleanup path.
