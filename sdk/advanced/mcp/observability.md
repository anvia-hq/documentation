# Observability

Treat MCP tools as external dependencies so operators can distinguish connection failures, remote tool failures, model failures, and local tool failures.

## 1. Preserve server identity

```ts
import { McpClient } from '@anvia/core/mcp'

const crmClient = new McpClient({
  name: 'customer-crm',
  transport: {
    type: 'streamableHttp',
    url: config.crmMcpUrl,
  },
})
const crm = await crmClient.connect()
```

Adapted tools carry the stable server name into Anvia's tool observation metadata. Avoid random, environment-specific names that make runs difficult to group.

## 2. Correlate the parent run

```ts
const response = await agent.generate({
    prompt: message,
    trace: {
        name: 'support-mcp-run',
        userId: user.id,
        metadata: {
            tenantId: user.tenantId,
            requestId,
        },
    }
})
```

A trace should connect model selection, the MCP tool call, result or failure, and final agent response without capturing unnecessary private payloads.

## 3. Observe connection lifecycle separately

Agent observers start after MCP connection and tool listing. Record startup, listing, and `crmClient.close()` separately so those failures remain visible even when no agent run begins.

Useful fields include server name, transport, connection duration, listed and exposed tool counts, reviewed tool names, tool latency, failure category, parent run ID, and cleanup outcome.

Never log credentials, raw private arguments, complete remote results, or sensitive resource content by default.

## 4. Preserve failure classes

Keep DNS and connection failures, tool-listing failures, argument validation, remote `isError` results, model failures, and local tool failures distinct. They have different owners and recovery paths.

Map failures to stable user-facing messages while retaining a protected correlation ID.

Inspect server identity, definitions, schemas, and direct tool behavior before debugging model routing. Studio can help with [MCP inspection](/studio/mcp).

Finish with the [MCP checklist](/sdk/advanced/mcp/checklist).
