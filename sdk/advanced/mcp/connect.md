# Connect a server

`McpClient` owns one MCP transport. `connect()` returns an immutable server snapshot with adapted tools; the client owns cleanup.

## 1. Connect through stdio

Use stdio when the application starts and owns a local MCP process:

```ts
import { McpClient } from '@anvia/core/mcp'

const filesystemClient = new McpClient({
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
const filesystem = await filesystemClient.connect()
```

Construction is lazy. `connect()` starts the process, connects the MCP client, lists tools, and adapts each definition.

If tool listing fails after connection, Anvia attempts to close the client before rethrowing the listing error.

## 2. Inspect before registration

```ts
console.log(filesystem.name)

for (const tool of filesystem.tools) {
  console.log(await tool.definition(''))
}
```

The server exposes its stable `name`, readonly adapted `tools`, and server metadata. Review names, descriptions, and input schemas before exposing privileged tools.

## 3. Register all or selected tools

```ts
const agent = new Agent({
  id: 'docs-operator',
  model,
  mcpServers: [filesystem],
})
```

This registers every listed tool. Pass an allow-listed subset through `tools` when the server exposes more capability than the agent needs.

## 4. Own cleanup

```ts
const client = new McpClient(connectionOptions)
const server = await client.connect()

try {
  const agent = createAgent(server)
  return await agent.generate({
      prompt: message
  })
} finally {
  await client.close()
}
```

Jobs, scripts, tests, and request-scoped connections should close in `finally`. Long-running applications should connect once during startup, reuse the server, and close it during shutdown.

Do not reconnect and list tools for every message unless credentials or remote visibility are intentionally request-scoped.

Next, choose a [stdio, streamable HTTP, or custom transport](/sdk/advanced/mcp/transports).
