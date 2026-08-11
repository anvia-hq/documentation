# MCP

The MCP view shows the remote tools available to a Studio agent, grouped by the Model Context Protocol server that supplied them. Use it to confirm that the expected server connected, review the model-facing contracts, and exercise a remote tool before relying on model routing.

Open `http://localhost:4021/ui/mcps` when Studio is running on port `4021`.

Studio does not establish MCP connections from the browser. Your application connects to each server, registers it on an agent, and then passes the built agent to Studio.

## Register an MCP-backed agent

```ts
import { AgentBuilder } from '@anvia/core/agent'
import { connectMcp, mcp } from '@anvia/core/mcp'
import { Studio } from '@anvia/studio'

const counterServer = await connectMcp(
  mcp.stdio({
    name: 'counter',
    command: 'tsx',
    args: ['mcp-counter-server.ts'],
  }),
)

const agent = new AgentBuilder('counter-agent', model)
  .instructions('Use the counter tools for arithmetic and updates.')
  .mcp([counterServer])
  .build()

new Studio([agent]).start({ port: 4021 })
```

`connectMcp(...)` starts or connects to the server, lists its tools, and adapts them into Anvia tools. Studio reads the resulting tool metadata from the registered agent. For transport selection, allow-listing, credentials, and connection cleanup, use the [Anvia SDK MCP documentation](/sdk/advanced/mcp).

## Read the inventory

Select an agent at the top of the page when Studio has more than one. The summary reports the number of MCP servers and tools for that agent. Each server section then shows:

- the MCP server name and owning agent ID;
- every discovered tool's name and description;
- whether the definition entered the agent through its static or dynamic registry;
- the number of input fields and complete JSON parameter schema;
- any discoverable approval policy.

Studio groups tools by their MCP provenance, so a tool registered through `.mcp(...)` can have a `static` source while still appearing under its server name. Definitions are de-duplicated by server, source, and tool name.

If a server is missing, confirm that it connected successfully and that at least one of its adapted tools was registered on the selected agent. The Studio page cannot list a server that never reached the built agent.

## Run an MCP tool directly

Select **Use**, provide JSON-compatible arguments, and select **Run**. Studio invokes the adapted tool through the same agent tool registry and displays its result, error, timing, and any emitted stream events.

For example, an arithmetic tool might accept:

```json
{
  "a": 8,
  "b": 13
}
```

This checks the complete remote execution path: local input validation, the MCP transport, the remote handler, and result adaptation. It does not ask a model to choose the tool and does not create an agent turn.

::: warning Direct execution can mutate the remote system
The MCP runner is not a dry run. It calls the selected tool immediately, and an approval badge does not add an approval step to this runner. Use development credentials and test data for tools that write, send, charge, delete, or trigger jobs.
:::

Use the [Playground approval workflow](/studio/playground/approvals-and-questions) to test an agent run that pauses for human approval. Use [Run tools directly](/studio/tools/run-tools-directly) for the common result and failure behavior shared by local, dynamic, and MCP tools.

## Studio and MCP have different responsibilities

| Responsibility | Owner |
| --- | --- |
| Connect, authenticate, and close the server | Application runtime |
| Decide which remote tools an agent receives | Agent configuration |
| Validate authorization and tenancy | Application and MCP server |
| Show server/tool inventory and schemas | Studio |
| Manually invoke a registered tool during development | Studio |
| Trace the tool chosen during an agent run | Studio traces |

After testing the handler directly, run a representative prompt and [inspect its trace](/studio/traces/inspect-a-trace). That verifies the separate question of whether the model received and selected the intended MCP tool.
