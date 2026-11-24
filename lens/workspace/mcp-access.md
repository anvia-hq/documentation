# MCP access

Lens can serve read-only observability tools to an AI assistant through **Streamable HTTP** at `/api/mcp`. This is Lens exposing retained diagnostics, not an Anvia agent connecting to arbitrary MCP tools or executing application work.

Owners and admins manage tokens from **MCP Access** in workspace navigation. One token reads every active project in its workspace; it is not a project-scoped credential.

## Create and connect a token

1. Open **MCP Access** and create a token with a recognizable name.
2. Choose an optional expiry. Leave **Allow raw payload access** disabled unless the assistant is permitted to receive that data.
3. Copy the one-time secret and store it in the assistant client's protected configuration.
4. Configure a client that supports remote Streamable HTTP with a static Authorization header:

```json
{
  "mcpServers": {
    "anvia-lens": {
      "type": "http",
      "url": "https://lens.example.com/api/mcp",
      "headers": {
        "Authorization": "Bearer mcp-lens-..."
      }
    }
  }
}
```

Client configuration formats vary; use the URL and Bearer header in your client's equivalent remote-HTTP configuration. Use HTTPS beyond localhost. OAuth and local stdio access are not included in this Lens server integration.

The secret is revealed only once. Do not commit it, paste it into prompts, or put it in browser code. Even without raw payload permission, diagnostic summaries can contain sensitive identifiers and operational information.

## Start with project discovery

Call `list_projects` first. Every other data tool requires a `projectId` returned by that call.

| Tool | Purpose |
| --- | --- |
| `list_projects` | Discover active projects readable by this token. |
| `get_overview` | Inspect project metrics for 24h, 7d, or 30d. |
| `search_traces` | Filter/paginate trace summaries. |
| `get_trace` | Read trace summary, bounded span tree, and evaluation results. |
| `get_span` | Inspect one span and, when authorized, its raw data. |
| `search_sessions` | Filter/paginate session summaries. |
| `get_session` | Inspect session history, with cursor pagination. |
| `list_alerts` | Inspect active/resolved alert incidents. |
| `get_alert` | Read incident signal, contributors, and evidence links. |

These tools do not modify reviews, delete telemetry, manage credentials, run agents, or configure alerts. Each result includes project context and a Lens web link when available.

## Control payload access

Raw span inputs/outputs, attributes, events, links, evaluation payloads, and conversational turns require both:

1. a token created with **Allow raw payload access**;
2. `includePayload: true` on the relevant `get_trace`, `get_span`, or `get_session` call.

Without the request flag, these fields remain omitted even for an eligible token. A request flag cannot grant permission to a restricted token. Payload inclusion still cannot recover data omitted by capture policy or retention.

## Bounded results

Trace inspection returns at most 500 spans and 100 evaluation results, with omission counts. Trace/session searches default to a 24-hour interval and allow up to 90 days; pages support 25, 50, or 100 rows. Session detail provides a continuation cursor.

Responses are capped at 256 KiB; narrow searches or request a specific span after `result_too_large`. A read-only response is not an export of all retained telemetry. The deployment's `MCP_RATE_LIMIT_PER_MINUTE` defaults to 120 requests per token.

## Revoke and offboard

Revoke unused or exposed tokens from **MCP Access**. Revocation and expiry prevent subsequent authenticated calls; tokens cannot be recovered from a membership removal alone. Removing or demoting the creator does not revoke an issued token—review it separately during [offboarding](/lens/workspace/members-and-roles#remove-a-member).

## Upgrading existing tokens

Migration revokes historical project-scoped tokens; recreate them from **MCP Access**. Organization scoping assigns existing workspace-wide tokens to their creator's workspace and removes tokens whose creator has no workspace membership. Verify the intended workspace after upgrading rather than assuming old credentials still work.

Reviewed against [Lens's MCP tools](https://github.com/anvia-hq/lens/blob/b06101f36392d4b1bab5a1b69a53d29e67fc22f5/apps/api/src/modules/mcp/tools.ts), token router, and migrations at v0.20.0 on 2026-11-23.
