# @anvia/memory-sqlite

`@anvia/memory-sqlite` provides durable Anvia agent memory backed by Node's SQLite runtime. It is a practical choice for local applications, single-process services, tests, and development tools that need persistence without a separate database server.

## Install

```sh
pnpm add @anvia/memory-sqlite @anvia/core
```

The package is ESM-only and peers with `@anvia/core >=0.13.0 <1.0.0`. It uses `node:sqlite`, so run it on a Node.js version that provides `DatabaseSync`.

## Create a persistent store

```ts
import { AgentBuilder } from '@anvia/core/agent'
import { createSqliteMemoryStore } from '@anvia/memory-sqlite'

const memory = createSqliteMemoryStore({
  path: 'data/anvia-memory.sqlite',
})

const agent = new AgentBuilder('support', model)
  .memory(memory, { savePolicy: 'turn' })
  .build()
```

Omitting `path` creates an in-memory SQLite database. Use an explicit path when state must survive a restart.

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
const memory = createSqliteMemoryStore({
  path: 'data/anvia-memory.sqlite',
  scope: {
    includeUserId: true,
    metadataKeys: ['tenantId'],
  },
})
```

You can also provide `(context) => string` for complete control. Scope separates stored histories; it is not an authorization check.

## Schema ownership

By default, the store creates three dedicated tables on first database access:

- `anvia_memory_sessions`
- `anvia_memory_messages`
- `anvia_memory_errors`

It also creates the ordered-message index. Set `createIfMissing: false` only when your deployment creates this exact schema before the application starts. The package does not export its internal SQLite DDL, so treat package upgrades as a reason to review the [changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-sqlite/CHANGELOG.md) before managing the schema yourself.

## Production patterns

- Put the database on durable storage and back up the file with an SQLite-aware process.
- Run one writer process unless your deployment has explicitly tested its SQLite concurrency model.
- Keep `validateMessages: true` at untrusted persistence boundaries.
- Use `errors: 'ignore'` only when failed-run payloads are intentionally excluded.
- Keep the database path outside ephemeral build output.

For horizontally scaled workers or multiple application instances, use a shared adapter such as [Postgres memory](/packages/memory-postgres).

## Reference

- [API reference](/packages/memory-sqlite/api-reference)
- [Memory store adapters](/sdk/memory/store-adapters)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/memory-sqlite)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-sqlite/CHANGELOG.md)
