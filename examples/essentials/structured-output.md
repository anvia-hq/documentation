# Structured output

This recipe turns one support ticket into a typed object. The data is returned only after the model's JSON passes a Zod schema.

## 1. Define and request the shape

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

const model = new OpenAIClient({ apiKey })
    .completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})

const result = await generateCompletion({
    prompt: `Customer: Acme Co.
Priority: high
Message: Checkout requests have failed for 20 minutes.`,
    model,
    outputSchema: ticketSchema,
    instructions: 'Classify the ticket using only stated facts.'
})

console.log(result.output.priority)
console.log(result.output.summary)
```

Run the file with `pnpm tsx structured-output.ts`.

## How validation works

`generateCompletion(...)` converts the Zod schema to provider JSON Schema, performs one completion, parses the returned JSON, and validates it with the same schema. TypeScript infers `result.output` from `ticketSchema`.

Invalid JSON or a schema mismatch rejects the call. Do not fall back to trusting `result.text` after validation fails.

## Choose the right primitive

Use this helper when one model request should produce one object. Use an agent `outputSchema` when tools, memory, retrieval, or multiple turns must run first. Agent output remains text and should be parsed with `JSON.parse` and the Zod schema after a completed run.

A schema proves shape, not truth. Recheck identifiers, permissions, and business rules before using fields for writes, billing, or access decisions.

Continue with [schema design](/sdk/structured-output/schema-design) and [validation errors](/sdk/structured-output/validation-errors).
