# @anvia/memory-sqlite API reference

All public symbols are exported from `@anvia/memory-sqlite`.

```ts
import {
  createSqliteMemoryScopeKey,
  createSqliteMemoryStore,
  SqliteMemoryStore,
  type SqliteMemoryAppendInput,
  type SqliteMemoryContext,
  type SqliteMemoryErrorInput,
  type SqliteMemoryErrorMode,
  type SqliteMemoryMessageRow,
  type SqliteMemoryScopeOptions,
  type SqliteMemorySessionRow,
  type SqliteMemoryStoreOptions,
} from '@anvia/memory-sqlite'
```

## Factory and scope functions

```ts
function createSqliteMemoryStore(
  options?: SqliteMemoryStoreOptions,
): SqliteMemoryStore

function createSqliteMemoryScopeKey(
  context: MemoryContext,
  options?: SqliteMemoryScopeOptions,
): string
```

The factory defaults to `path: ':memory:'`. The scope helper serializes the selected context values into the same key format used by the store.

## SqliteMemoryStore

```ts
class SqliteMemoryStore implements MemoryStore {
  readonly kind: 'sqlite'
  readonly inspector: MemoryInspector
  readonly compaction: MemoryCompactionStore

  constructor(
    path: string,
    options: {
      createIfMissing: boolean
      errors: SqliteMemoryErrorMode
      validateMessages: boolean
      scope?: SqliteMemoryStoreOptions['scope']
    },
  )

  load(context: MemoryContext): Promise<Message[]>
  append(input: MemoryAppendInput): Promise<void>
  clear(context: MemoryContext): Promise<void>
  recordError(input: MemoryErrorInput): Promise<void>
}
```

Prefer `createSqliteMemoryStore()` to the low-level constructor because the factory resolves all defaults.

## Options

```ts
type SqliteMemoryErrorMode = 'store' | 'ignore'

type SqliteMemoryScopeOptions = {
  includeUserId?: boolean
  metadataKeys?: string[]
}

type SqliteMemoryStoreOptions = {
  path?: string
  scope?: SqliteMemoryScopeOptions | ((context: MemoryContext) => string)
  errors?: SqliteMemoryErrorMode
  validateMessages?: boolean
  createIfMissing?: boolean
}
```

Defaults are `includeUserId: true`, `metadataKeys: []`, `errors: 'store'`, `validateMessages: true`, and `createIfMissing: true`.

## Row types

```ts
type SqliteMemorySessionRow = {
  id: string
  scope_key: string
  session_id: string
  user_id: string | null
  metadata_json: string
  created_at: string
  updated_at: string
}

type SqliteMemoryMessageRow = {
  message_json: string
}
```

These types describe row projections used by SQLite integrations. They do not expose additional store operations.

## Core aliases

```ts
type SqliteMemoryAppendInput = MemoryAppendInput
type SqliteMemoryContext = MemoryContext
type SqliteMemoryErrorInput = MemoryErrorInput
```

The aliased types come from `@anvia/core/memory`.

Return to the [package guide](/packages/memory-sqlite).
