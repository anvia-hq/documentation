# Trust boundaries

An MCP server is an external capability source. Connecting to it does not mean every listed tool is appropriate for every agent or user.

## Keep responsibilities separate

| Boundary | Owner |
| --- | --- |
| MCP transport credentials | Application runtime |
| Which server tools are exposed | Agent factory and app policy |
| User and tenant authorization | Runner and product services |
| Remote tool validation | MCP server |
| Product side effects | App-owned tool or reviewed remote service |
| User-facing result filtering | Application transport or projection layer |

Prompt instructions may describe policy, but they must not be its only enforcement.

## Allow-list remote tools

`.mcp([server])` registers every adapted tool. For privileged servers, inspect and select tools before building the agent:

```ts
import type { AnyTool } from '@anvia/core'

async function allowMcpTools(
  tools: AnyTool[],
  allowedNames: Set<string>,
) {
  const reviewed: AnyTool[] = []

  for (const tool of tools) {
    const definition = await tool.definition('')

    if (allowedNames.has(definition.name)) {
      reviewed.push(tool)
    }
  }

  return reviewed
}

const docsTools = await allowMcpTools(
  docsServer.tools,
  new Set(['search_docs', 'read_doc']),
)

const agent = new AgentBuilder('docs-assistant', model)
  .tools(docsTools)
  .build()
```

Review tool descriptions and schemas as well as names. A stable name can still acquire broader input or output behavior after a server update.

## Constrain broad capabilities

File, shell, database, browser, and network tools can cross major trust boundaries. Prefer a server configured with a narrow root, command allow-list, read-only credential, or restricted network identity.

If the remote server cannot enforce the product boundary you need, wrap its tools in app-owned policy or run the server in a constrained environment.

## Re-check product permissions

The MCP server may know whether its service credential can perform an action; it may not know whether the current product user should be allowed to request it.

Resolve user and tenant scope in the runner, use scoped credentials where possible, and keep sensitive side effects behind product-owned checks and approval flows.

## Filter remote output

Remote results can contain sensitive fields, oversized payloads, misleading instructions, or unsafe media. Filter and redact them before user-facing transport. Do not expose raw MCP errors to the browser.

## Avoid name collisions

Do not register an MCP tool with the same name as a local tool or a tool from another server. Names are part of the model-facing contract; collisions make routing and audit records ambiguous.
