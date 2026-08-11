# @anvia/memory-postgres API reference

All public symbols are exported from `@anvia/memory-postgres`.

```ts
import {
  createPostgresMemorySchemaSql,
  createPostgresMemoryScopeKey,
  createPostgresMemoryStore,
  PostgresMemoryStore,
  type PostgresMemoryAppendInput,
  type PostgresMemoryClientLike,
  type PostgresMemoryContext,
  type PostgresMemoryErrorInput,
  type PostgresMemoryErrorMode,
  type PostgresMemoryLockMode,
  type PostgresMemoryPoolLike,
  type PostgresMemoryQueryResult,
  type PostgresMemorySchemaOptions,
  type PostgresMemoryScopeOptions,
  type PostgresMemoryStoreOptions,
  type PostgresMemoryTableNames,
  type PostgresMemoryTransactionClientLike,
} from '@anvia/memory-postgres'
```

## Functions

```ts
function createPostgresMemoryStore(
  options?: PostgresMemoryStoreOptions,
): Promise<PostgresMemoryStore>

function createPostgresMemoryScopeKey(
  context: MemoryContext,
  options?: PostgresMemoryScopeOptions,
): string

function createPostgresMemorySchemaSql(
  options?: PostgresMemorySchemaOptions,
): string
```

`createPostgresMemorySchemaSql()` uses the same table-name resolution as the store.

## PostgresMemoryStore

```ts
class PostgresMemoryStore implements MemoryStore {
  readonly kind: 'postgres'
  readonly inspector: MemoryInspector
  readonly compaction: MemoryCompactionStore

  static connect(
    options?: PostgresMemoryStoreOptions,
  ): Promise<PostgresMemoryStore>

  load(context: MemoryContext): Promise<Message[]>
  append(input: MemoryAppendInput): Promise<void>
  clear(context: MemoryContext): Promise<void>
  recordError(input: MemoryErrorInput): Promise<void>
}
```

## Store and schema options

```ts
type PostgresMemoryErrorMode = 'store' | 'ignore'
type PostgresMemoryLockMode = 'advisory' | 'none'

type PostgresMemoryScopeOptions = {
  includeUserId?: boolean
  metadataKeys?: string[]
}

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
  client?: PostgresMemoryClientLike
  connectionString?: string
  createIfMissing?: boolean
  scope?: PostgresMemoryScopeOptions | ((context: MemoryContext) => string)
  errors?: PostgresMemoryErrorMode
  validateMessages?: boolean
  lock?: PostgresMemoryLockMode
}
```

The default prefix is `anvia_`. Runtime defaults are `createIfMissing: true`, `errors: 'store'`, `validateMessages: true`, and `lock: 'advisory'`.

## Client types

```ts
type PostgresMemoryQueryResult = {
  rows: Record<string, unknown>[]
}

type PostgresMemoryClientLike = {
  query(
    text: string,
    values?: readonly unknown[],
  ): Promise<PostgresMemoryQueryResult>
}

type PostgresMemoryTransactionClientLike = PostgresMemoryClientLike & {
  release(): void
}

type PostgresMemoryPoolLike = PostgresMemoryClientLike & {
  connect(): Promise<PostgresMemoryTransactionClientLike>
}
```

## Core aliases

```ts
type PostgresMemoryAppendInput = MemoryAppendInput
type PostgresMemoryContext = MemoryContext
type PostgresMemoryErrorInput = MemoryErrorInput
```

Return to the [package guide](/packages/memory-postgres).
