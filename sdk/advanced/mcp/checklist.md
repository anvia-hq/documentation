# MCP checklist

Review the connection, capability set, and product boundary before shipping MCP-backed agents.

## Connection and lifecycle

- Keep MCP credentials and endpoints server-side.
- Use a stable, meaningful name for every server.
- Decide whether each connection is shared, tenant-scoped, or job-scoped.
- Close shared connections during shutdown.
- Close short-lived connections in `finally`.
- Define whether startup continues when an optional server is unavailable.

## Tool review

- Allow-list tools appropriate for the agent's role.
- Review names, descriptions, input schemas, and result shapes.
- Re-review tools after server upgrades.
- Avoid name collisions across local and MCP sources.
- Constrain file, command, database, browser, and network access.

## Authorization and data

- Enforce user and tenant policy outside prompt text.
- Keep sensitive product writes in app-owned permission paths.
- Validate tool input on the remote server.
- Redact private fields from results and errors.
- Bound large text, image, resource, and binary results.
- Treat remote content as untrusted model input.

## Operations

- Trace MCP calls with the server name and parent run ID.
- Distinguish connection, remote tool, model, and local tool failures.
- Map remote failures to safe user-facing messages.
- Monitor latency, error rate, tool-list changes, and cleanup failures.
- Test degraded behavior when an optional server is unavailable.

## Test the boundary

| Scenario | Verify |
| --- | --- |
| Server adds an unreviewed tool | Agent does not receive it. |
| User lacks product permission | Remote action is not allowed. |
| MCP returns private or oversized data | Result is filtered or rejected. |
| Remote call returns `isError` | Runner maps the failure safely. |
| Agent run throws | Short-lived server still closes. |
| Local and MCP tools share a name | Agent construction or review catches it. |

An MCP integration is production-ready only when the application can explain which server supplied a tool, why the agent was allowed to call it, and how the connection is cleaned up.
