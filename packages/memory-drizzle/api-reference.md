# @anvia/memory-drizzle API reference

All public symbols are exported from `@anvia/memory-drizzle`.

```ts
import {
  agentMemoryErrors,
  agentMemoryMessages,
  agentMemorySessions,
  createDrizzleMemoryScopeKey,
  createDrizzleMemoryStore,
  drizzleMemorySchema,
  DrizzleMemoryStore,
  type DrizzleMemoryAppendInput,
  type DrizzleMemoryContext,
  type DrizzleMemoryDatabaseLike,
  type DrizzleMemoryErrorInput,
  type DrizzleMemoryErrorMode,
  type DrizzleMemoryLockMode,
  type DrizzleMemorySchema,
  type DrizzleMemoryScopeOptions,
  type DrizzleMemoryStoreOptions,
} from '@anvia/memory-drizzle'
```

## Schema exports

The four schema values are Drizzle PostgreSQL table definitions:

| Export | Database object |
| --- | --- |
| `agentMemorySessions` | `agent_memory_sessions` with UUID ID, unique scope key, session/user IDs, JSONB metadata, and timestamps. |
| `agentMemoryMessages` | `agent_memory_messages` with its session relation, run, turn, ordered position, role, JSONB message, and timestamp. |
| `agentMemoryErrors` | `agent_memory_errors` with its session relation, run, JSONB error/messages, and timestamp. |
| `drizzleMemorySchema` | `{ agentMemorySessions, agentMemoryMessages, agentMemoryErrors }` as a readonly object. |

```ts
type DrizzleMemorySchema = typeof drizzleMemorySchema
```

`agentMemoryMessages` has a unique `(memorySessionId, position)` index. Sessions have a unique scope-key index, and both child tables cascade on session deletion.

## Functions

```ts
function createDrizzleMemoryStore(
  db: DrizzleMemoryDatabaseLike,
  options?: DrizzleMemoryStoreOptions,
): DrizzleMemoryStore

function createDrizzleMemoryScopeKey(
  context: MemoryContext,
  options?: DrizzleMemoryScopeOptions,
): string
```

## DrizzleMemoryStore

```ts
class DrizzleMemoryStore implements MemoryStore {
  readonly kind: 'drizzle'
  readonly inspector: MemoryInspector
  readonly compaction: MemoryCompactionStore

  constructor(
    db: DrizzleMemoryDatabaseLike,
    schema: DrizzleMemorySchema,
    options: {
      errors: DrizzleMemoryErrorMode
      lock: DrizzleMemoryLockMode
      validateMessages: boolean
      scope?: DrizzleMemoryStoreOptions['scope']
    },
  )

  load(context: MemoryContext): Promise<Message[]>
  append(input: MemoryAppendInput): Promise<void>
  clear(context: MemoryContext): Promise<void>
  recordError(input: MemoryErrorInput): Promise<void>
}
```

Use `createDrizzleMemoryStore()` so the default schema and runtime options are resolved for you.

## Options

```ts
type DrizzleMemoryDatabaseLike = object
type DrizzleMemoryErrorMode = 'store' | 'ignore'
type DrizzleMemoryLockMode = 'advisory' | 'none'

type DrizzleMemoryScopeOptions = {
  includeUserId?: boolean
  metadataKeys?: string[]
}

type DrizzleMemoryStoreOptions = {
  schema?: DrizzleMemorySchema
  scope?: DrizzleMemoryScopeOptions | ((context: MemoryContext) => string)
  errors?: DrizzleMemoryErrorMode
  validateMessages?: boolean
  lock?: DrizzleMemoryLockMode
}
```

Defaults are `includeUserId: true`, `metadataKeys: []`, `errors: 'store'`, `validateMessages: true`, and `lock: 'advisory'`.

## Core aliases

```ts
type DrizzleMemoryAppendInput = MemoryAppendInput
type DrizzleMemoryContext = MemoryContext
type DrizzleMemoryErrorInput = MemoryErrorInput
```

Return to the [package guide](/packages/memory-drizzle).
