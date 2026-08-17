# Get started

Use the Drizzle adapter when your PostgreSQL schema and migrations already belong to Drizzle.

```sh
pnpm add @anvia/core @anvia/memory-drizzle drizzle-orm
```

Preview the canonical schema exports, then write them:

```sh
npx @anvia/memory-drizzle init
npx @anvia/memory-drizzle init --write
npx drizzle-kit generate
npx drizzle-kit migrate
```

```ts
import { Agent } from '@anvia/core/agent'
import { DrizzleMemoryStore } from '@anvia/memory-drizzle'

const memory = new DrizzleMemoryStore({ db })

const agent = new Agent({
  id: 'support',
  model: model,
  memory: { store: memory, savePolicy: 'turn' },
})
```

The package's tables use Drizzle's PostgreSQL core. It does not create database objects at runtime.

## Next

- [Schema and migrations](/packages/memory-drizzle/schema-and-migrations)
- [Configuration](/packages/memory-drizzle/configuration)
- [Production](/packages/memory-drizzle/production)
