# Local tools

Combine reviewed MCP tools with local tools when application-owned permissions, transactions, approval, or side effects must remain inside the product boundary.

## 1. Register both sources

```ts
const agent = new Agent({
  id: 'operations',
  model,
  mcpServers: [runbookServer, monitoringServer],
  tools: [
    createIncidentTool(scope),
    createApprovalStatusTool(scope),
  ],
  maxTurns: 6,
})
```

Both sources appear in the same model-facing tool set and use the normal agent loop.

Use MCP tools for reviewed remote lookup or constrained remote capability. Use local tools for product authorization, database writes, application approval, idempotency, and transactions.

## 2. Register an allow-listed subset

```ts
const docsTools = await allowMcpTools(
  docsServer.tools,
  new Set(['search_docs', 'read_doc']),
)

const agent = new Agent({
  id: 'support',
  model,
  tools: [
    ...docsTools,
    createCustomerLookupTool(scope),
    createTicketTool(scope),
  ],
})
```

This avoids registering the full server through `mcpServers`.

## 3. Keep routing distinct

Names and descriptions should distinguish external lookup from product action. Prefer `search_runbooks` and `create_incident` over two tools described as “handle incidents.”

Check collisions across every local, MCP, and skill source before constructing the agent.

## 4. Keep lifecycle ownership outside the agent

The agent does not close MCP servers. The application that connected them must close them during shutdown or job cleanup, even when an agent run fails.

Local tool dependencies have their own application lifecycle and do not change MCP connection ownership.

Next, add [observability](/sdk/advanced/mcp/observability).
