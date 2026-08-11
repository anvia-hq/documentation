# @anvia/memory-prisma API reference

All module symbols below are exported from `@anvia/memory-prisma`. The package also exposes the `anvia-memory-prisma` executable used by `npx @anvia/memory-prisma init`; the CLI is not a JavaScript subpath export.

```ts
import {
  createPrismaMemoryScopeKey,
  createPrismaMemoryStore,
  PrismaMemoryStore,
  type PrismaMemoryAppendData,
  type PrismaMemoryAppendInput,
  type PrismaMemoryClientLike,
  type PrismaMemoryContext,
  type PrismaMemoryConventionalDelegates,
  type PrismaMemoryDelegates,
  type PrismaMemoryErrorData,
  type PrismaMemoryErrorDelegate,
  type PrismaMemoryErrorInput,
  type PrismaMemoryErrorMode,
  type PrismaMemoryMessageDelegate,
  type PrismaMemoryScopeOptions,
  type PrismaMemorySessionCreateData,
  type PrismaMemorySessionDelegate,
  type PrismaMemoryStoreOptions,
  type PrismaMemoryTransactionOptions,
} from '@anvia/memory-prisma'
```

## Functions

```ts
function createPrismaMemoryStore(
  client: unknown,
  options?: PrismaMemoryStoreOptions,
): PrismaMemoryStore

function createPrismaMemoryScopeKey(
  context: MemoryContext,
  options?: PrismaMemoryScopeOptions,
): string
```

## PrismaMemoryStore

```ts
class PrismaMemoryStore implements MemoryStore {
  readonly kind: 'prisma'
  readonly inspector: MemoryInspector | undefined
  readonly compaction: MemoryCompactionStore | undefined

  static fromClient(
    client: unknown,
    options?: PrismaMemoryStoreOptions,
  ): PrismaMemoryStore

  static fromDelegates(
    delegates: PrismaMemoryDelegates,
    options?: PrismaMemoryStoreOptions,
  ): PrismaMemoryStore

  load(context: MemoryContext): Promise<Message[]>
  append(input: MemoryAppendInput): Promise<void>
  clear(context: MemoryContext): Promise<void>
  recordError(input: MemoryErrorInput): Promise<void>
}
```

## Options

```ts
type PrismaMemoryErrorMode = 'store' | 'ignore'

type PrismaMemoryScopeOptions = {
  includeUserId?: boolean
  metadataKeys?: string[]
}

type PrismaMemoryTransactionOptions = {
  isolationLevel?: string
}

type PrismaMemoryStoreOptions = {
  scope?: PrismaMemoryScopeOptions | ((context: MemoryContext) => string)
  errors?: PrismaMemoryErrorMode
  validateMessages?: boolean
  transaction?: PrismaMemoryTransactionOptions
}
```

Defaults are `includeUserId: true`, `metadataKeys: []`, `errors: 'store'`, and `validateMessages: true`.

## Delegate contracts

```ts
type PrismaMemorySessionDelegate = {
  upsert(args: unknown): Promise<{ id: string }>
  deleteMany(args: unknown): Promise<unknown>
  findMany?(args: unknown): Promise<unknown[]>
  findUnique?(args: unknown): Promise<unknown | null>
}

type PrismaMemoryMessageDelegate = {
  findMany(args: unknown): Promise<Array<{ message: unknown }>>
  findFirst(args: unknown): Promise<{ position: number } | null>
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

## Data types

```ts
type PrismaMemorySessionCreateData = {
  scopeKey: string
  sessionId: string
  userId?: string
  metadata: JsonObject
}

type PrismaMemoryAppendData = {
  memorySessionId: string
  runId: string
  turn: number
  position: number
  role: Message['role']
  message: Message
}

type PrismaMemoryErrorData = {
  memorySessionId: string
  runId: string
  error: JsonValue
  messages: Message[]
}
```

## Core aliases

```ts
type PrismaMemoryAppendInput = MemoryAppendInput
type PrismaMemoryContext = MemoryContext
type PrismaMemoryErrorInput = MemoryErrorInput
```

Return to the [package guide](/packages/memory-prisma).
