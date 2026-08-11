# Local tools

Combine reviewed MCP capabilities with local tools when the application must retain product-specific permissions and side effects.

## Register both sources

```ts
const agent = new AgentBuilder('operations', model)
  .tools([
    createIncidentTool(scope),
    createApprovalStatusTool(scope),
  ])
  .mcp([runbookServer, monitoringServer])
  .defaultMaxTurns(6)
  .build()
```

Local and MCP tools appear in the same model-facing tool set and run through the normal agent tool loop.

## Choose the owner by responsibility

| Capability | Prefer |
| --- | --- |
| Search an external documentation server | MCP tool |
| Query an existing remote capability service | MCP tool |
| Enforce product user and tenant permissions | Local tool or scoped wrapper |
| Perform a product database write | Local tool |
| Require application approval or idempotency | Local tool |
| Access a constrained external system already exposed through MCP | Reviewed MCP tool |

Use local tools for behavior that must remain coupled to your product's authorization, transaction, and audit path.

## Combine an allow-listed subset

When a server exposes more than the agent needs, add selected MCP tools through `.tools(...)`:

```ts
const docsTools = await allowMcpTools(
  docsServer.tools,
  new Set(['search_docs', 'read_doc']),
)

const agent = new AgentBuilder('support', model)
  .tools([
    ...docsTools,
    createCustomerLookupTool(scope),
    createTicketTool(scope),
  ])
  .build()
```

This avoids registering the full server through `.mcp(...)`.

## Keep names and descriptions distinct

The model should be able to tell external lookup from product action. Prefer names such as `search_runbooks` and `create_incident` over two tools both described as “handle incidents.”

Check tool names across every local and MCP source before building the agent.

## Close every connected server

The agent does not own MCP lifecycle. The application that connected `runbookServer` and `monitoringServer` must close them during shutdown or job cleanup, even when the agent run fails.

Local tools do not change that ownership: they are ordinary application objects and require their own service cleanup only when their dependencies do.
