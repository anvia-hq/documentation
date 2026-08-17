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

## Next

- [Schema and migrations](/packages/memory-prisma/schema-and-migrations)
- [Configuration](/packages/memory-prisma/configuration)
- [Production](/packages/memory-prisma/production)
