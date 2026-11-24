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
pnpm add @anvia/memory-prisma @anvia/core @prisma/orm-postgres@8.0.0-rc.20
pnpm add -D prisma@8.0.0-rc.27
pnpm exec anvia-memory-prisma init --prisma-version 8 --contract src/prisma/contract.prisma
```

Add `--write` after reviewing the generated contract. The 1.3.0 CLI starts a new contract with the
required `// use prisma-8` directive and generates `@onCreate(cuid(2))` for new IDs. Emit the contract,
then build the caller-owned Prisma 8 PostgreSQL client with `contractFromJson` from
`@prisma/orm-postgres/static` — passing the raw `contractJson` no longer type-checks:

```ts
import postgres from '@prisma/orm-postgres/runtime'
import { contractFromJson } from '@prisma/orm-postgres/static'
import { PrismaMemoryStore } from '@anvia/memory-prisma/v8'
import type { Contract } from './generated/contract.js'
import contractJson from './generated/contract.json' with { type: 'json' }

const db = postgres({
  url: process.env.DATABASE_URL!,
  contract: contractFromJson<Contract>(contractJson),
})

const memory = new PrismaMemoryStore({ client: db })
await memory.validate()
```

Run `pnpm exec prisma contract emit` after contract changes, and keep `resolveJsonModule` enabled.

The `/v8` entrypoint supports inspection, transactional compaction, custom model mappings, and the
same scope/error policies as the Prisma 7 store. The application owns migrations and closes the
client during shutdown.

## Next

- [Schema and migrations](/packages/memory-prisma/schema-and-migrations)
- [Configuration](/packages/memory-prisma/configuration)
- [Production](/packages/memory-prisma/production)
