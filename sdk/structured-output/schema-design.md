# Schema design

The schema is the contract product code will trust after validation. Design it for the application decision, not as a transcript of everything the model could say.

## 1. Define a narrow schema

```sh
pnpm add zod
```

```ts
import { z } from 'zod'

export const ticketSchema = z.object({
  category: z.enum(['billing', 'technical', 'account']),
  priority: z.enum(['low', 'normal', 'high']),
  summary: z.string().min(1).max(500),
  needsHumanReview: z.boolean(),
})

export type Ticket = z.infer<typeof ticketSchema>
```

Prefer enums over open-ended labels, booleans over ambiguous status text, and bounded strings or numbers when the product has a real limit. Required fields are usually easier to handle than many optional branches.

## 2. Describe domain meaning

Descriptions become JSON Schema metadata and can help a provider distinguish fields with similar names:

```ts
const escalationSchema = z
  .object({
    reason: z.string().describe(
      'One sentence explaining why a human must review the ticket.',
    ),
    severity: z.enum(['normal', 'urgent']),
  })
  .meta({ title: 'support_escalation' })
```

Use `.describe()` for field meaning and `.meta({ title })` when a stable root schema name is useful. Descriptions guide generation; they do not replace validation or business rules.

## 3. Separate model output from application state

Do not ask the model to generate fields that the application already knows, such as the authenticated tenant ID, database primary key, billing amount, or permission level. Merge trusted application state after validation:

```ts
const classified = ticketSchema.parse(modelValue)

const ticket = {
  ...classified,
  tenantId: request.auth.tenantId,
  createdBy: request.auth.userId,
}
```

This keeps authorization and identity outside the model-controlled payload.

## 4. Keep provider schemas portable

Anvia converts Zod to JSON Schema before sending it to a provider. The selected [completion model](/sdk/models/completion) must report `capabilities.outputSchema: true` for parsed completions and agent output schemas.

Providers can differ in the JSON Schema features they accept. Smoke-test unions, recursive types, transforms, refinements, defaults, and deeply nested schemas on the exact provider and model used in production.

Local Zod parsing remains the final trust boundary even when the provider accepts the schema.

Next, use the schema in a [parsed completion](/sdk/structured-output/parsed-completion).
