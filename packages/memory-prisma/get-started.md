# Get started

Use the Prisma adapter when Prisma owns the PostgreSQL schema and client lifecycle.

```sh
pnpm add @anvia/core @anvia/memory-prisma @prisma/client
```

Preview and write the memory models, then migrate and generate the client:

```sh
npx @anvia/memory-prisma init
npx @anvia/memory-prisma init --write
npx prisma migrate dev --name add_anvia_memory
npx prisma generate
```

```ts
import { PrismaMemoryStore } from '@anvia/memory-prisma'

const memory = new PrismaMemoryStore({ client: prisma })
```

The conventional constructor expects `agentMemorySession`, `agentMemoryMessage`, `agentMemoryError`, and `$transaction` on the generated client. Pass `{ delegates }` instead when models are exposed under different names.

## Prisma 8 PostgreSQL

Prisma 8 uses a separate runtime and contract workflow. It requires Node.js 22.18+ (or 24.11+ on
Node 24) and TypeScript 5.9+:

```sh
pnpm add @anvia/memory-prisma @anvia/core @prisma/orm-postgres@8.0.0-rc.11
pnpm add -D prisma@8.0.0-rc.15
pnpm exec anvia-memory-prisma init --prisma-version 8 --contract src/prisma/contract.prisma
```

Add `--write` after reviewing the generated contract. Import the store from the versioned
entrypoint and pass the caller-owned Prisma 8 PostgreSQL client:

```ts
import { PrismaMemoryStore } from '@anvia/memory-prisma/v8'

const memory = new PrismaMemoryStore({ client: db })
await memory.validate()
```

The `/v8` entrypoint supports inspection, transactional compaction, custom model mappings, and the
same scope/error policies as the Prisma 7 store. The application owns migrations and closes the
client during shutdown.

## Next

- [Schema and migrations](/packages/memory-prisma/schema-and-migrations)
- [Configuration](/packages/memory-prisma/configuration)
- [Production](/packages/memory-prisma/production)
