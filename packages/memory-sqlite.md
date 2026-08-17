# @anvia/memory-sqlite

`@anvia/memory-sqlite` provides durable Anvia agent memory backed by Node's SQLite runtime. It is a practical choice for local applications, single-process services, tests, and development tools that need persistence without a separate database server.

## Install

```sh
pnpm add @anvia/memory-sqlite @anvia/core
```

The package is ESM-only and should be installed with the matching `@anvia/core` release candidate. It uses `node:sqlite`, so run it on a Node.js version that provides `DatabaseSync`.

## Create a persistent store

```ts
import { Agent } from '@anvia/core/agent'
import { SqliteMemoryClient } from '@anvia/memory-sqlite'

const memoryClient = new SqliteMemoryClient({
  path: 'data/anvia-memory.sqlite',
})
const memory = memoryClient.memoryStore()
await memory.ensure()

const agent = new Agent({
  id: 'support',
  model: model,
  memory: { store: memory, savePolicy: 'turn' },
})
```

Pass `path: ':memory:'` for an in-memory SQLite database. Use an explicit file path when state must survive a restart.

## What it provides

- Ordered message persistence implementing the core `MemoryStore` contract.
- Transactional appends and cascading conversation deletion.
- Stored failed-run details by default.
- Runtime message validation by default.
- A read-only memory inspector and compaction store for compatible SDK and Studio workflows.
- Configurable scope keys built from session, user, and metadata values.

Read [Configure memory](/sdk/memory/configure) for agent integration and [Compaction](/sdk/memory/compaction) for lifecycle behavior.

## Scope conversations deliberately

The default scope contains `sessionId` and `userId`. Add stable tenant keys when the same IDs can exist in several workspaces:

```ts
const memoryClient = new SqliteMemoryClient({
  path: 'data/anvia-memory.sqlite',
})
const memory = memoryClient.memoryStore({
  scopeKey: {
    includeUserId: true,
    metadataKeys: ['tenantId'],
  },
})
```

You can also provide `({ scope }) => string` for complete control. Scope separates stored histories; it is not an authorization check.

## Schema ownership

Calling `store.ensure()` creates three dedicated tables:

- `anvia_memory_sessions`
- `anvia_memory_messages`
- `anvia_memory_errors`

It also creates the ordered-message index. When application migrations own the schema, use `createSqliteMemorySchemaSql()` to obtain the DDL and call `store.validate()` at startup instead of `ensure()`.

## Production patterns

- Put the database on durable storage and back up the file with an SQLite-aware process.
- Run one writer process unless your deployment has explicitly tested its SQLite concurrency model.
- Keep `validateMessages: true` at untrusted persistence boundaries.
- Use `errorPolicy: 'ignore'` only when failed-run payloads are intentionally excluded.
- Keep the database path outside ephemeral build output.

For horizontally scaled workers or multiple application instances, use a shared adapter such as [Postgres memory](/packages/memory-postgres).

## Reference

- [API reference](/packages/memory-sqlite/api-reference)
- [Memory store adapters](/sdk/memory/store-adapters)
- [Source](https://github.com/anvia-hq/anvia/tree/v1-rc3/packages/memory-sqlite)
- [Changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/memory-sqlite/CHANGELOG.md)
