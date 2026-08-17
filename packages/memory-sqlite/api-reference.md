# @anvia/memory-sqlite API reference

All public symbols are exported from `@anvia/memory-sqlite`.

```ts
import {
  createSqliteMemorySchemaSql,
  SqliteMemoryClient,
  SqliteMemoryStore,
  type SqliteMemoryClientOptions,
  type SqliteMemoryDatabaseLike,
  type SqliteMemoryErrorPolicy,
  type SqliteMemorySchemaOptions,
  type SqliteMemoryStoreOptions,
  type SqliteMemoryTableNames,
} from '@anvia/memory-sqlite'
```

## SqliteMemoryClient

The client owns a built-in `node:sqlite` database or wraps an injected database.

```ts
class SqliteMemoryClient implements AsyncDisposable {
  constructor(options:
    | { path: string; database?: never }
    | { database: SqliteMemoryDatabaseLike; path?: never }
  )

  memoryStore(options?: SqliteMemoryStoreOptions): SqliteMemoryStore
  nativeClient(): Promise<SqliteMemoryDatabaseLike>
  close(): Promise<void>
  [Symbol.asyncDispose](): Promise<void>
}
```

Pass `path: ':memory:'` for an in-memory database. An injected database remains owned by the application and is not closed by `SqliteMemoryClient`.

## SqliteMemoryStore

```ts
class SqliteMemoryStore implements MemoryStore {
  readonly kind: 'sqlite'
  readonly inspector: MemoryInspector
  readonly compaction: MemoryCompactionCapability

  ensure(): Promise<void>
  validate(): Promise<void>
  load(options: MemoryLoadOptions): Promise<Message[]>
  append(options: MemoryAppendOptions): Promise<void>
  clear(options: MemoryClearOptions): Promise<void>
  recordError(options: MemoryErrorOptions): Promise<void>
}
```

Create a store with `client.memoryStore()`. Call `ensure()` when this process owns schema creation, or `validate()` after application-managed migrations.

## Schema helper

```ts
function createSqliteMemorySchemaSql(
  options?: SqliteMemorySchemaOptions,
): string
```

The helper returns the DDL used by `store.ensure()`.

## Options

```ts
type SqliteMemoryErrorPolicy = 'store' | 'ignore'

type SqliteMemoryTableNames = {
  sessions?: string
  messages?: string
  errors?: string
  messagesPositionIndex?: string
}

type SqliteMemorySchemaOptions = {
  tablePrefix?: string
  tableNames?: SqliteMemoryTableNames
}

type SqliteMemoryStoreOptions = SqliteMemorySchemaOptions & {
  scopeKey?: MemoryScopeKeyResolver
  errorPolicy?: SqliteMemoryErrorPolicy
  validateMessages?: boolean
}
```

`scopeKey` accepts either `{ includeUserId?, metadataKeys? }` or a function receiving `{ scope }` and returning a stable string.

Return to the [package guide](/packages/memory-sqlite).
