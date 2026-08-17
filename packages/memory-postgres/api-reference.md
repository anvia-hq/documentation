# @anvia/memory-postgres API reference

All public symbols are exported from `@anvia/memory-postgres`.

```ts
import {
  createPostgresMemorySchemaSql,
  PostgresMemoryClient,
  PostgresMemoryStore,
  type PostgresMemoryClientLike,
  type PostgresMemoryClientOptions,
  type PostgresMemoryErrorPolicy,
  type PostgresMemoryLockMode,
  type PostgresMemoryPoolLike,
  type PostgresMemoryQueryResult,
  type PostgresMemorySchemaOptions,
  type PostgresMemoryStoreOptions,
  type PostgresMemoryTableNames,
  type PostgresMemoryTransactionClientLike,
} from '@anvia/memory-postgres'
```

## PostgresMemoryClient

```ts
class PostgresMemoryClient implements AsyncDisposable {
  constructor(options:
    | { connectionString: string; client?: never }
    | { client: PostgresMemoryClientLike; connectionString?: never }
  )

  memoryStore(options?: PostgresMemoryStoreOptions): PostgresMemoryStore
  nativeClient(): Promise<PostgresMemoryClientLike>
  close(): Promise<void>
  [Symbol.asyncDispose](): Promise<void>
}
```

A connection string creates a managed `pg.Pool`. An injected client remains owned by the application.

## PostgresMemoryStore

```ts
class PostgresMemoryStore implements MemoryStore {
  readonly kind: 'postgres'
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

Create a store with `client.memoryStore()`. Call `ensure()` when the adapter should create its schema, or `validate()` after application-managed migrations.

## Schema helper

```ts
function createPostgresMemorySchemaSql(
  options?: PostgresMemorySchemaOptions,
): string
```

## Options

```ts
type PostgresMemoryErrorPolicy = 'store' | 'ignore'
type PostgresMemoryLockMode = 'advisory' | 'none'

type PostgresMemoryTableNames = {
  sessions?: string
  messages?: string
  errors?: string
}

type PostgresMemorySchemaOptions = {
  tablePrefix?: string
  tableNames?: PostgresMemoryTableNames
}

type PostgresMemoryStoreOptions = PostgresMemorySchemaOptions & {
  scopeKey?: MemoryScopeKeyResolver
  errorPolicy?: PostgresMemoryErrorPolicy
  validateMessages?: boolean
  lock?: PostgresMemoryLockMode
}
```

## Client contracts

```ts
type PostgresMemoryQueryResult = {
  rows: Record<string, unknown>[]
}

type PostgresMemoryClientLike = {
  query(
    text: string,
    values?: readonly unknown[],
  ): Promise<PostgresMemoryQueryResult>
  end?(): Promise<void>
}

type PostgresMemoryTransactionClientLike = PostgresMemoryClientLike & {
  release(): void
}

type PostgresMemoryPoolLike = PostgresMemoryClientLike & {
  connect(): Promise<PostgresMemoryTransactionClientLike>
}
```

Return to the [package guide](/packages/memory-postgres).
