# Schema design

The schema is the contract product code will trust after validation. Design it for the application decision, not as a transcript of everything the model could say.

## 1. Define a narrow schema

```sh
pnpm add zod
```

Anvia requires Zod 4: `@anvia/core` depends on `zod ^4.5.4`, and schema conversion uses `z.toJSONSchema()` and `.meta()`, which are Zod-4-only APIs. Zod 3 is not supported.

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

Parsed completions also accept any [Standard Schema](https://standardschema.dev), so Valibot (or ArkType and other implementing libraries) works wherever `generateCompletion()` or `streamCompletion()` takes an `outputSchema`. Agent output schemas, extractors, and tool schemas stay Zod-only.

```sh
pnpm add valibot @valibot/to-json-schema
```

```ts
import * as v from 'valibot'

export const ticketSchema = v.object({
  category: v.picklist(['billing', 'technical', 'account']),
  priority: v.picklist(['low', 'normal', 'high']),
  summary: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
  needsHumanReview: v.boolean(),
})

export type Ticket = v.InferOutput<typeof ticketSchema>
```

Valibot conversion needs the optional `@valibot/to-json-schema` peer installed; without it (or when another library has no conversion support) the call fails before any model request with a descriptive error. Transformed schemas whose validation input and output differ (for example `string -> number`) are supported: providers receive the schema's input representation and the validated, possibly transformed value becomes the result output. Core also exports `StandardSchemaV1`, `StandardJSONSchemaV1`, and `isStandardSchema` for libraries and adapters that build on the contract.

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

Anvia converts the schema to JSON Schema before sending it to a provider — Zod through its built-in converter, Valibot through `@valibot/to-json-schema`, other libraries through the Standard JSON Schema interface (`~standard.jsonSchema`). The selected [completion model](/sdk/models/completion) must report `capabilities.outputSchema: true` for parsed completions and agent output schemas.

Providers can differ in the JSON Schema features they accept. Smoke-test unions, recursive types, transforms, refinements, defaults, and deeply nested schemas on the exact provider and model used in production. Object nodes without an explicit `additionalProperties` are sent with `false` so payloads stay eligible for provider strict modes such as OpenAI structured outputs.

Local schema parsing remains the final trust boundary even when the provider accepts the schema. Validation runs synchronously through `~standard.validate`: schemas that validate asynchronously are rejected with a `CompletionStructuredOutputError` in the `schema` phase.

Next, use the schema in a [parsed completion](/sdk/structured-output/parsed-completion).
