# When should I use tools, MCP, or approvals?

Use a tool to expose an application capability to an agent. Use MCP when that capability is supplied by an external Model Context Protocol server. Use approval when a particular proposed tool call must pause for a human or application decision.

| Need | Use |
| --- | --- |
| Call an app-owned service with a typed contract | [Local tool](/sdk/tools) |
| Discover tools from an external protocol server | [MCP](/sdk/advanced/mcp) |
| Pause a sensitive proposed action before execution | [Tool approval](/sdk/advanced/hooks/tool-control) |

These choices compose: an MCP-adapted tool participates in the normal agent tool loop, and a local or dynamic tool can require approval.

## Does a schema authorize a tool call?

No. Schemas validate model-facing input and output shapes. The handler must still check authenticated user and tenant permissions, business rules, idempotency, and side-effect policy. Read [Tool security](/sdk/tools/security).

## Does approval replace authorization?

No. Approval answers whether this proposed action may continue. It does not prove identity, grant database access, make a command safe, or undo an action that already happened. When a run returns `suspended`, keep its continuation on the trusted server, collect an authorized matching response, and continue through `agent.generate({ continuation, response })`.

Use [Studio approvals](/studio/playground/approvals-and-questions) to exercise the flow locally.

## Is every MCP server safe to attach?

No. MCP servers are external capability sources. The application owns transport credentials, connection cleanup, the exposed tool allow-list, product permissions, and result filtering. Prefer app-owned tools when the operation needs product-specific authorization or idempotency.

Model tool support is also provider- and model-dependent. Verify the exact completion model in the [capability matrix](/sdk/providers/capability-matrix).
