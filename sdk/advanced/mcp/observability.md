# Observability

Trace MCP tools as external dependencies so operators can distinguish remote capability failures from local tool and model failures.

## Preserve server identity

MCP-adapted tools carry their server name in tool metadata. Anvia observers can use that metadata to identify which connected server supplied a tool.

Choose stable, meaningful names when connecting:

```ts
const crm = await connectMcp(
  mcp.http({
    name: 'customer-crm',
    url: config.crmMcpUrl,
  }),
)
```

Avoid environment-specific random names that make traces difficult to group.

## Trace the parent run

```ts
const response = await agent
  .prompt(message)
  .withTrace({
    name: 'support-mcp-run',
    userId: user.id,
    metadata: {
      tenantId: user.tenantId,
      requestId,
    },
  })
  .send()
```

The trace should connect the model's tool choice, the adapted MCP tool call, its result or error, and the final agent response.

## Observe connection lifecycle

Agent observers begin after the tools are already connected. Record startup and shutdown separately so connection, tool-listing, and cleanup failures are visible even when no agent run starts.

Useful operational fields include:

- MCP server name and transport
- connection and tool-listing duration
- exposed tool count and reviewed tool names
- tool latency and failure category
- parent run ID and trace ID
- cleanup success or failure

Do not log credentials, raw private arguments, full remote results, or sensitive resource contents by default.

## Distinguish failure classes

Keep transport connection failures, remote tool errors, argument validation errors, model failures, and local tool failures separate. They have different owners and recovery paths.

Map raw remote messages to safe user-facing errors while retaining a correlation ID for internal diagnosis.

## Inspect tools before runs

Use internal tooling or [Studio MCP inspection](https://anvia.dev/docs/studio/tools-and-human-review) to verify server identity, listed tools, schemas, and direct tool behavior before debugging agent routing.
