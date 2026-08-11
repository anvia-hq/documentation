# Production operations

Production Anvia deployments keep the runtime boundary explicit: the server authenticates users, constructs trusted dependencies, runs agents, and emits only the events a client may receive.

## Security boundary

- Keep provider credentials on the server.
- Authenticate and authorize before creating a prompt or session.
- Treat memory scope as storage isolation, not permission checking.
- Validate tool inputs and outputs, then enforce product permissions inside tool execution.
- Keep sandbox networking and command allowlists as narrow as the task permits.

## Bound agent work

Set `defaultMaxTurns` on agents and lower it per request when a flow needs tighter limits. Tool-assisted runs need enough turns for the model to request a tool, receive its result, and produce a final answer.

## Durable memory

Use stable session, user, tenant, workspace, or organization identifiers. The Prisma memory store computes the same scope key for load, append, and clear operations; a changed scope points to a different thread.

Load stored messages on the server when hydrating an existing UI. Browser state is only a view of memory—the next POST should still run the durable server session, which reloads history from the store.

## Stream from the server

Return normalized runtime events with `@anvia/server`. JSONL is the default for Anvia clients; SSE supports clients that require `text/event-stream`.

Handle disconnects and error events at the application boundary. Never expose provider API keys to the browser.

## Observe conservatively

Record lifecycle, failure, usage, run, and trace metadata. Keep message content, model payloads, final output, and tool results out of logs unless policy allows their retention.

## Clean up sandboxes

Destroy sandbox sessions even when a request fails:

```ts
const session = await sandbox.createSession()

try {
  // Run the agent with sandbox-backed tools.
} finally {
  await session.destroy()
}
```

Start with explicit command allowlists, timeouts, output limits, file-size limits, and disabled networking. Expand them only for a demonstrated product requirement.
