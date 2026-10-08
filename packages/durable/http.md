# HTTP server and client

Durable runs, static graphs, and custom tasks are exposed through two opt-in subpaths. The existing
`@anvia/server` and `@anvia/client` entrypoints do not load the durable runtime or SQLite, and the browser
client uses the validated `@anvia/durable/protocol` entrypoint.

```sh
pnpm add @anvia/durable @anvia/server @anvia/client
```

## Server handler

```ts
import { createDurableHandler } from '@anvia/server/durable'

const handleRequest = createDurableHandler({
  runtime,
  basePath: '/durable',
  maxBodyBytes: 65_536,
  authorize: async (request, resource) => {
    const user = await authenticate(request) // supplied by your application
    return user !== null && (await canAccessSession(user, resource.sessionId, resource.action))
  },
})
// Mount handleRequest in any Fetch-compatible server; keep runtime at application scope.
```

`authorize` is required for every operation, including reads and event subscriptions. It receives a
`DurableAuthorization` resource with `action` (`list`, `submit`, `inspect`, `events`, `respond`,
`resolve-tool`, `retry`, `cancel`, `signal`, or `resolve-effect`), the owning `sessionId`, and where
applicable `runId`, `agentId`, `graphId`, `taskId`, `rootTaskId`, and `taskName`. Existing-run authorization
uses the session stored in the database, never a client-supplied one. Owned agent runs map to their parent
task's session. Graph children authorize against the graph's owning session, and graph-wide operations
authorize every task. Listings require a `sessionId`. Your host supplies identity, CORS and CSRF policy, and
lifecycle. SSE authorization is checked at connection time (task tree events reauthorize each emitting task).

### Routes

| Method | Path under `basePath` | Result |
| --- | --- | --- |
| POST | `/runs` | Submit `{ agentId, sessionId, requestId, prompt, enqueue? }`; returns a snapshot (202). |
| GET | `/runs?sessionId=...` | Summaries; optional `agentId`, `status`, `after`, `limit`. |
| GET | `/runs/:id` | Atomic snapshot. |
| GET | `/runs/:id/events?after=...` | SSE events; `Last-Event-ID` is the fallback cursor. |
| POST | `/runs/:id/respond` | `{ interactionId, response }` (204). |
| POST | `/runs/:id/resolve-tool` | `{ operationId, output }` (204). |
| POST | `/runs/:id/retry` | Explicit retry (204). |
| POST | `/runs/:id/cancel` | Persist cancellation (204). |
| POST | `/graphs` | Submit a graph and return its snapshot (202). |
| GET | `/graphs?sessionId=...` | List graphs; optional `after`, `limit`. |
| GET | `/graphs/:id` | Atomic topology, node state, and cursor. |
| GET | `/graphs/:id/events?after=...` | SSE task events. |
| POST | `/graphs/:id/cancel` | Cancel unfinished work (204). |
| POST | `/tasks` | Submit `{ name, version, sessionId, requestId, input }` to a registered definition. |
| GET | `/tasks?sessionId=...` | Paginated root tasks. |
| GET | `/tasks/:id` | Atomic snapshot and cursor. |
| GET | `/tasks/:id/graph` | Entire ownership tree. |
| GET | `/tasks/:id/events` | Reconnectable tree SSE; `after` or `Last-Event-ID`. |
| POST | `/tasks/:id/signal` | `{ name, requestId, value }`. |
| POST | `/tasks/:id/resolve-effect` | `{ key, value }`. |
| POST | `/tasks/:id/retry` | Resume a task needing attention. |
| POST | `/tasks/:id/cancel` | Cancel the selected subtree. |

JSON bodies default to a 64 KiB limit (`maxBodyBytes`). Errors map to 400 (validation), 403 (denied), 404,
409 (conflict), 413 (oversized body), 415 (media type), 429 (durable limit), and 500 without internal
diagnostics. Responses disable caching, and SSE frames use the durable event sequence as their `id`. A
transport error closes the stream without cancelling execution. Task cancellation returns 409 without
mutating the tree if children appeared during authorization; retry to authorize the new tree.

Executable code is registered on the server. Clients only select registered names and versions and supply
JSON, so allowlist the task definitions and agents each caller may use: granting submission or retry of a
definition authorizes its spawning behavior. No global metrics or health route is exposed, because the
authorization contract is session scoped. Export `runtime.health()` and `runtime.metrics()` through your own
authenticated endpoint.

## Browser client

```ts
import { DurableClient } from '@anvia/client/durable'

const client = new DurableClient({
  endpoint: 'https://your-app.example/durable',
  headers: () => ({ Authorization: `Bearer ${getAccessToken()}` }),
})
const accepted = await client.submit(
  {
    agentId: 'researcher',
    sessionId: 'research-session',
    requestId: 'research-job-42',
    prompt: 'Summarize these notes...',
  },
  { enqueue: true },
)
const snapshot = await client.snapshot(accepted.run.id)
render(snapshot)
for await (const event of client.stream(accepted.run.id, { after: snapshot.cursor })) {
  renderEvent(event)
}
```

`DurableClientOptions` are `endpoint` (an absolute HTTP(S) base URL with no credentials, query, or fragment),
`fetch`, `headers` (a value or an async function), and `credentials`.

| Area | Methods |
| --- | --- |
| Runs | `submit`, `snapshot`, `listRuns`, `stream`, `respond`, `resolveTool`, `retry`, `cancel` |
| Graphs | `submitGraph`, `graphSnapshot`, `listGraphs`, `streamGraph`, `cancelGraph` |
| Tasks | `submitTask`, `taskSnapshot`, `taskGraph`, `listTasks`, `streamTask`, `signalTask`, `resolveEffect`, `retryTask`, `cancelTask` |

Requests accept an `abortSignal`; aborting a stream detaches only that subscriber. The client validates
incoming snapshots and events, rejects wrong-run, wrong-root, and out-of-order events, and throws
`DurableHttpError` with the HTTP status on a failed response. It never retries mutations automatically. On a
connection failure, reconnect from a fresh snapshot or from the last event cursor your application applied.
Durable progress events are not the token-delta chat protocol used by the standard client transport.
