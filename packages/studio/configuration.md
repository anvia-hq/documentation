# Configuration

`StudioOptions` configures targets around five boundaries: quick prompts, stores, UI, model catalog, and evaluation suites.

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

Register providers with stable IDs and a `createCompletionModel` factory. Optional static definitions and `listModels` populate the catalog. Per-agent policies define defaults and allowed `provider:model` references.

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

See [runtime boundary](/packages/studio/runtime-boundary) and [UI/server options](/studio/configure/ui-and-server-options).
