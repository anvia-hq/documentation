# MCP checklist

Review connection ownership, capability scope, data handling, and operations before shipping an MCP-backed agent.

## Connection and lifecycle

- Keep credentials and endpoints server-side.
- Keep Streamable HTTP SSRF protection strict unless the application deliberately owns and trusts a local or private-network endpoint.
- Never let request data or model output select `ssrfProtection: 'disabled'`.
- Configure static Streamable HTTP headers as a trusted string record; never forward an arbitrary caller-supplied header map.
- Use either a static `Authorization` header or `authProvider`, never both.
- Verify configured headers reach only the exact MCP endpoint and are absent from OAuth traffic.
- Give every server a stable name.
- Choose shared, tenant, request, or job connection scope deliberately.
- Close shared connections during shutdown.
- Close short-lived connections in `finally`.
- Decide whether an unavailable optional server degrades or fails startup.

## Tool review

- Allow-list tools appropriate for the agent role.
- Review names, descriptions, input schemas, result shapes, and side effects.
- Re-review after server upgrades.
- Detect name collisions before agent construction.
- Constrain file, command, database, browser, and network access.

## Authorization and data

- Enforce user and tenant policy outside prompt text.
- Keep sensitive product writes in application-owned permission paths.
- Validate remote tool input on the MCP server.
- Redact private result and error fields.
- Bound text, image, resource, and binary results.
- Treat remote content as untrusted model input.

## Operations

- Correlate MCP calls with server and parent run IDs.
- Distinguish connection, listing, argument, remote tool, model, and local tool failures.
- Map raw failures to safe public messages.
- Monitor latency, errors, tool-list changes, and cleanup failures.
- Test degraded behavior for optional servers.

## Boundary tests

Verify that a newly listed unreviewed tool does not reach the agent, unauthorized callers cannot perform remote actions, private or oversized output is filtered, and `isError` results are mapped safely. For a remote Streamable HTTP server, verify that loopback and private destinations remain blocked and endpoint redirects do not forward configured headers. For an intentional local opt-out, verify that the endpoint is fixed by trusted application configuration.

Verify that short-lived servers close when the run throws and name collisions are caught by the application's review step.

The integration is ready only when the application can explain which server supplied a tool, why the caller and agent were allowed to invoke it, how its output is filtered, and who closes the connection.
