# Schema design

Treat the schema as the contract product code will trust after validation.

## Define a narrow schema

```sh
pnpm add zod
```

```ts
import { z } from 'zod'

export const ticketSchema = z.object({
  category: z.enum(['billing', 'technical', 'account']),
  priority: z.enum(['low', 'normal', 'high']),
  summary: z.string().min(1),
  needsHumanReview: z.boolean(),
})

export type Ticket = z.infer<typeof ticketSchema>
```

Prefer enums, booleans, bounded numbers, and required strings over vague fields or deeply nested objects. Narrow schemas are easier for models to produce and applications to test.

## Describe ambiguous fields

```ts
const escalationSchema = z.object({
  reason: z.string().describe(
    'Short reason the ticket should be escalated.',
  ),
  severity: z.enum(['normal', 'urgent']),
})
```

`.describe(...)` becomes JSON Schema description metadata and can guide provider generation. It does not replace validation or product rules.

Use `.meta({ title: 'Escalation' })` on a root schema when a stable schema name is useful. Do not rely on a `.metadata(...)` method or arbitrary provider-specific metadata.

## Keep schemas portable

Provider adapters translate Zod into provider output schemas. Check that the selected [completion model](/sdk/models/completion) supports output schemas, and smoke-test advanced Zod features on the exact provider path.

Local Zod parsing remains the final boundary even when the provider accepts the schema.
