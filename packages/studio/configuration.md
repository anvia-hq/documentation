# Configuration

`StudioOptions` configures targets around quick prompts, stores, UI, model catalog, evaluation
suites, sandboxes, and graph explorers.

## Graphs

```ts
const studio = new Studio([agent], {
  graphs: [{
    id: 'support',
    name: 'Support knowledge graph',
    graph,
  }],
})
```

The registration ID must be non-empty and unique. `graph` implements the provider-neutral
`GraphExplorer` contract from `@anvia/graph`; Neo4j and Memgraph registrations satisfy it directly.
See the [Studio graph explorer](/studio/graphs).

## Stores

```ts
import { createSqliteSessionStore, Studio } from '@anvia/studio'

const store = createSqliteSessionStore({ path: '.anvia/studio.db' })

const studio = new Studio([agent, pipeline], {
  stores: {
    sessions: store,
    traces: store,
    pipelineLogs: store,
    pipelineRuns: store,
  },
})
```

The built-in SQLite implementation uses dedicated `anvia_studio_*` tables. Each surface has a public store contract, so applications can split stores or provide another backend. Sessions, pipeline logs, or pipeline runs can be disabled where their option accepts `false`; traces accept a trace store when custom persistence is required.

## Models

Register providers with stable IDs and a `createCompletionModel({ modelId })` factory. Optional static definitions and `listModels` populate the catalog. Global and per-agent defaults use `{ providerId, modelId }`; allowed entries accept the same object or a provider wildcard such as `openai:*`.

Model policy is enforced by the Studio runtime; a request outside an agent's allowed set is rejected. The factory still owns provider credentials and provider-specific construction.

## UI

```ts
const studio = new Studio([agent], {
  ui: {
    path: '/playground',
    title: 'Support Studio',
    rootRoutes: true,
    redirectRoot: true,
    clientScript: `console.info('Studio client loaded')`,
  },
})
```

`path`, `rootRoutes`, and `redirectRoot` change route presentation. `clientScript` is JavaScript source served as the Studio client module, so only provide trusted code. `protectShell` is a public option but currently does not authenticate users or protect runtime APIs.

## Serving

`start()` launches a Node HTTP server and returns immediately. If `port` is omitted, Studio checks `RUNNER_PORT` and then uses `4021`. Use `fetch(request)` or the exposed Hono `app` when another server owns request dispatch.

Studio rejects requests whose `Host` header is not loopback or an explicitly trusted hostname. An
explicit non-wildcard `hostname` is trusted automatically; binding to `0.0.0.0` or `::` requires
listing client-facing names in `allowedHosts`. The same allowlist applies to `Origin` hostnames,
with ports ignored:

```ts
await new Studio([agent]).serve({
  hostname: '0.0.0.0',
  port: 4021,
  allowedHosts: ['studio.lan'],
})
```

List hostnames without schemes or ports. This check blocks DNS-rebinding and cross-origin attacks
on state-changing routes; it supplements, and does not replace, network controls and application
authentication.

See [runtime boundary](/packages/studio/runtime-boundary) and [UI/server options](/studio/configure/ui-and-server-options).
