# Structured output

This recipe turns one support ticket into a typed object. The data is returned only after the model's JSON passes a Zod schema.

## 1. Define and request the shape

Use the setup from [Text completion](./basic-completion), which installs `zod`, then save this as `structured-output.ts`:

```ts
import { generateCompletion } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { z } from 'zod'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error('Set OPENAI_API_KEY.')

const ticketSchema = z.object({
  customer: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high']),
  summary: z.string().min(1),
})

const model = new OpenAIClient({ apiKey }).completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' })

const result = await generateCompletion({
  model,
  prompt: `Customer: Acme Co.
Priority: high
Message: Checkout requests have failed for 20 minutes.`,
  instructions: 'Classify the ticket using only stated facts.',
  outputSchema: ticketSchema,
})

console.log(result.output.priority)
console.log(result.output.summary)
```

Run it with `pnpm tsx structured-output.ts`.

## How validation works

`generateCompletion(...)` converts the Zod schema to provider JSON Schema, performs one completion, parses the returned JSON, and validates it with the same schema. TypeScript infers `result.output` from `ticketSchema`.

Invalid JSON, a schema mismatch, a truncated response, or a content-filtered response rejects the call with `CompletionStructuredOutputError`; its `phase` reports which step failed. Do not fall back to trusting the raw text after validation fails. `outputSchema` accepts any Standard Schema, so Zod is one option rather than a requirement.

## Choose the right primitive

Use this helper when one model request should produce one object. Use an agent `outputSchema` when tools, memory, retrieval, or multiple turns must run first. The agent validates its final answer against the Zod schema, retries invalid structured output within its retry budget, and returns the parsed object as `result.output` when `result.type === 'response'`.

A schema proves shape, not truth. Recheck identifiers, permissions, and business rules before using fields for writes, billing, or access decisions.

Continue with [schema design](/sdk/structured-output/schema-design) and [validation errors](/sdk/structured-output/validation-errors).
