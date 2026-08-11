# Production

- Deploy Prisma migrations before starting code that uses the delegates.
- Use the generated client as an application singleton and disconnect it during shutdown.
- Configure a supported transaction isolation level for concurrent appends.
- Confirm split-schema discovery if the CLI generated `models/anvia-memory.prisma`.
- Back up message and error tables and apply the same privacy policy as prompt data.
- Preserve optional delegate methods if Studio inspection or memory compaction is required.

The adapter does not create tables, reconnect Prisma, or retry transaction failures. Custom delegate wrappers must preserve transaction-scoped delegates; passing global delegates from inside `transaction` weakens atomicity.

See [Configure memory](/sdk/memory/configure) for agent wiring.
