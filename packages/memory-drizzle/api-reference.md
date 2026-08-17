# @anvia/memory-drizzle API reference

All public symbols are exported from `@anvia/memory-drizzle`.

```ts
import {
  agentMemoryErrors,
  agentMemoryMessages,
  agentMemorySessions,
  drizzleMemorySchema,
  DrizzleMemoryStore,
  type DrizzleMemoryDatabaseLike,
  type DrizzleMemoryErrorPolicy,
  type DrizzleMemoryLockMode,
  type DrizzleMemorySchema,
  type DrizzleMemoryStoreOptions,
} from '@anvia/memory-drizzle'
```

## Schema exports

- `agentMemorySessions` defines `agent_memory_sessions` and its unique scope key.
- `agentMemoryMessages` defines ordered message rows with a unique session-position index.
- `agentMemoryErrors` defines failed-run diagnostics.
- `drizzleMemorySchema` contains all three tables for use in an application schema.

```ts
type DrizzleMemorySchema = typeof drizzleMemorySchema
```

## DrizzleMemoryStore

```ts
class DrizzleMemoryStore implements MemoryStore {
  readonly kind: 'drizzle'
  readonly inspector: MemoryInspector
  readonly compaction: MemoryCompactionCapability

  constructor(options: DrizzleMemoryStoreOptions)
  validate(): Promise<void>
  load(options: MemoryLoadOptions): Promise<Message[]>
  append(options: MemoryAppendOptions): Promise<void>
  clear(options: MemoryClearOptions): Promise<void>
  recordError(options: MemoryErrorOptions): Promise<void>
}
```

The constructor requires a database with transactional writes. Advisory locking additionally requires the database's `execute` method.

## Options

```ts
type DrizzleMemoryDatabaseLike = object
type DrizzleMemoryErrorPolicy = 'store' | 'ignore'
type DrizzleMemoryLockMode = 'advisory' | 'none'

type DrizzleMemoryStoreOptions = {
  db: DrizzleMemoryDatabaseLike
  schema?: DrizzleMemorySchema
  scopeKey?: MemoryScopeKeyResolver
  errorPolicy?: DrizzleMemoryErrorPolicy
  validateMessages?: boolean
  lock?: DrizzleMemoryLockMode
}
```

`scopeKey` accepts either `{ includeUserId?, metadataKeys? }` or a function receiving `{ scope }` and returning a stable string.

Return to the [package guide](/packages/memory-drizzle).
