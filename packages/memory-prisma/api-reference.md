# @anvia/memory-prisma API reference

The package exports the Prisma memory store and its delegate contracts. It also provides the `anvia-memory-prisma` executable used by `npx @anvia/memory-prisma init`; the CLI is not a JavaScript subpath export.

```ts
import {
  PrismaMemoryStore,
  type PrismaMemoryClientLike,
  type PrismaMemoryConventionalDelegates,
  type PrismaMemoryDelegates,
  type PrismaMemoryErrorDelegate,
  type PrismaMemoryErrorPolicy,
  type PrismaMemoryMessageDelegate,
  type PrismaMemoryMessageRow,
  type PrismaMemoryPositionRow,
  type PrismaMemorySessionDelegate,
  type PrismaMemorySessionRow,
  type PrismaMemoryStoreOptions,
  type PrismaMemoryTransactionOptions,
} from '@anvia/memory-prisma'
```

## PrismaMemoryStore

```ts
class PrismaMemoryStore implements MemoryStore {
  readonly kind: 'prisma'
  readonly inspector: MemoryInspector | undefined
  readonly compaction: MemoryCompactionCapability | undefined

  constructor(options: PrismaMemoryStoreOptions)
  validate(): Promise<void>
  load(options: MemoryLoadOptions): Promise<Message[]>
  append(options: MemoryAppendOptions): Promise<void>
  clear(options: MemoryClearOptions): Promise<void>
  recordError(options: MemoryErrorOptions): Promise<void>
}
```

Pass either the conventional generated Prisma client or explicit delegates:

```ts
type PrismaMemoryStoreOptions = {
  scopeKey?: MemoryScopeKeyResolver
  errorPolicy?: PrismaMemoryErrorPolicy
  validateMessages?: boolean
  transaction?: PrismaMemoryTransactionOptions
} & (
  | { client: object; delegates?: never }
  | { delegates: PrismaMemoryDelegates; client?: never }
)
```

## Delegate contracts

```ts
type PrismaMemorySessionRow = { id: string }
type PrismaMemoryMessageRow = { message: unknown }
type PrismaMemoryPositionRow = { position: number }

type PrismaMemorySessionDelegate = {
  upsert(args: unknown): Promise<PrismaMemorySessionRow>
  deleteMany(args: unknown): Promise<unknown>
  findMany?(args: unknown): Promise<unknown[]>
  findUnique?(args: unknown): Promise<unknown | null>
}

type PrismaMemoryMessageDelegate = {
  findMany(args: unknown): Promise<PrismaMemoryMessageRow[]>
  findFirst(args: unknown): Promise<PrismaMemoryPositionRow | null>
  createMany(args: unknown): Promise<unknown>
  deleteMany?(args: unknown): Promise<{ count: number }>
}

type PrismaMemoryErrorDelegate = {
  create(args: unknown): Promise<unknown>
}

type PrismaMemoryDelegates = {
  sessions: PrismaMemorySessionDelegate
  messages: PrismaMemoryMessageDelegate
  errors?: PrismaMemoryErrorDelegate
  transaction<T>(
    operation: (tx: PrismaMemoryDelegates) => Promise<T>,
    options?: PrismaMemoryTransactionOptions,
  ): Promise<T>
}
```

## Conventional client

```ts
type PrismaMemoryConventionalDelegates = {
  agentMemorySession: PrismaMemorySessionDelegate
  agentMemoryMessage: PrismaMemoryMessageDelegate
  agentMemoryError?: PrismaMemoryErrorDelegate
}

type PrismaMemoryClientLike = PrismaMemoryConventionalDelegates & {
  $transaction<T>(
    operation: (tx: PrismaMemoryConventionalDelegates) => Promise<T>,
    options?: PrismaMemoryTransactionOptions,
  ): Promise<T>
}
```

## Policies

```ts
type PrismaMemoryErrorPolicy = 'store' | 'ignore'

type PrismaMemoryTransactionOptions = {
  isolationLevel?: string
}
```

Inspection is available when the optional session lookup methods exist. Atomic compaction additionally requires `messages.deleteMany`.

Return to the [package guide](/packages/memory-prisma).
