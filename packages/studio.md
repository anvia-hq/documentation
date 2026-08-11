# `@anvia/studio`

`@anvia/studio` runs the Anvia Studio development UI and its HTTP runtime around registered agents and pipelines. It is the quickest way to exercise tools, inspect schemas and context, replay pipeline runs, and review local traces while developing.

## Install

```bash
pnpm add @anvia/core @anvia/studio
```

## Start Studio

```ts
import { Studio } from '@anvia/studio'

const studio = new Studio([supportAgent, triagePipeline], {
  quickPrompts: {
    support: ['Summarize this ticket', 'Draft a reply'],
  },
})

studio.start({ port: 4310, hostname: '127.0.0.1' })
```

Register built agents and pipelines, not their builders. Stable target IDs become Studio URLs, stored session keys, and replay references, so keep them unique.

## Persistence

Studio uses in-memory stores by default. For local persistence, supply the SQLite store to each supported surface:

```ts
import { createSqliteSessionStore, Studio } from '@anvia/studio'

const store = createSqliteSessionStore({ path: '.anvia/studio.db' })

const studio = new Studio([agent], {
  stores: {
    sessions: store,
    traces: store,
    pipelineLogs: store,
    pipelineRuns: store,
  },
})
```

## Security boundary

Studio is a trusted local development surface. Binding to a public interface can expose prompts, tool execution, stored sessions, knowledge, and sandbox access. `protectShell` changes shell delivery behavior; it is not authentication or authorization. Put an explicit access-control proxy in front of Studio if it must cross a trusted boundary.

## Common patterns

- Use `serve()` with an `AbortSignal` when another lifecycle owns startup and shutdown.
- Use `fetch()` or the exposed Hono `app` to mount Studio inside an existing server.
- Register model providers and per-agent policies when users should switch models in the Playground.
- Provide dedicated stores when sessions, traces, or pipeline replays must survive restarts.
- Pass sandbox instances only when the application owns their cleanup.

## Next steps

- [Public API](/packages/studio/api-reference)
- [Studio documentation](/studio/)
- [Configuration and security](/studio/configure/security-boundaries)
- [Package changelog](https://github.com/anvia-hq/anvia/blob/main/packages/tool-studio/CHANGELOG.md)

