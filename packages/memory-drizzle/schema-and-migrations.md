# Schema and migrations

The package exports PostgreSQL table definitions for:

- `agent_memory_sessions`
- `agent_memory_messages`
- `agent_memory_errors`

The `init` CLI is a safe schema helper. It defaults to a dry run and creates a sibling `anvia-memory.ts` only with `--write`:

```sh
npx @anvia/memory-drizzle init --schema src/db/schema.ts
npx @anvia/memory-drizzle init --schema src/db/schema.ts --write
```

Use `--append-to-schema` to append a marked block to the existing file. The CLI refuses conflicting exports and existing generated output; `--force` replaces only recognized generated files or marker blocks. Review the result before running Drizzle Kit.

The runtime never applies DDL. Include the generated file in `drizzle.config.ts`, generate a migration, and deploy it before the application. See the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-drizzle/CHANGELOG.md) when refreshing generated schema.
