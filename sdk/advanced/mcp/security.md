# Trust boundaries

An MCP server is an external capability source. Connecting does not make every listed tool appropriate for every agent or caller.

The application runtime owns transport credentials and connection scope. The agent factory owns which tools are exposed. Product services own user and tenant authorization. The MCP server owns remote validation. The public transport owns user-facing filtering.

## 1. Allow-list remote tools

```ts
import type { AnyTool } from '@anvia/core'

async function allowMcpTools(
  tools: readonly AnyTool[],
  allowedNames: ReadonlySet<string>,
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

const agent = new Agent({
  id: 'docs-assistant',
  model,
  tools: docsTools,
})
```

Review descriptions, schemas, result shapes, and remote behavior as well as names. Re-review after server upgrades.

## 2. Constrain broad capability

File, shell, database, browser, and network tools can cross major trust boundaries. Prefer narrow roots, command allow-lists, read-only credentials, restricted network identity, and sandboxing.

If a remote server cannot enforce the product boundary, wrap its capability in application-owned policy or do not expose it.

## 3. Re-check product permission

The server may know what its service credential can do but not what the current product user may request. Resolve caller scope in the runner, use scoped credentials where possible, and keep sensitive side effects behind product-owned authorization and approval.

Prompt instructions are not the only enforcement layer.

## 4. Prevent name collisions explicitly

Tool names form the model-facing routing contract. Audit names across local tools, MCP servers, and skills before agent construction.

Agent registration de-duplicates by name, and a later source can replace an earlier tool with the same name. Do not rely on construction to report collisions.

## 5. Filter remote output

Remote results can contain private fields, oversized payloads, misleading instructions, or unsafe media. Filter them before they enter a public response, and never return raw remote errors to the browser.

Next, combine MCP with [local tools](/sdk/advanced/mcp/local-tools).
