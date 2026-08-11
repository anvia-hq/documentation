# Parsed completion

Use `createParsedCompletion(...)` when one direct model call should return validated data.

## Return typed data

```ts
import { createParsedCompletion } from '@anvia/core'
import { z } from 'zod'

const ticketSchema = z.object({
  customer: z.string(),
  priority: z.enum(['low', 'normal', 'high']),
  summary: z.string().min(1),
})

const result = await createParsedCompletion(model, {
  schema: ticketSchema,
  instructions: 'Classify the support message.',
  input: 'Acme Co. reports checkout failures. Priority is high.',
})

console.log(result.data.customer)
console.log(result.data.priority)
```

`data` is inferred from the schema. The result also includes the normal completion text, content, usage, and provider response.

## What Anvia validates

Anvia converts the Zod schema to a provider output schema, calls the model once, parses the response text as JSON, and validates it with the same Zod schema.

The promise rejects when the response is not valid JSON or does not match the schema. Do not fall back to trusting `result.text` as product data.

## When to use it

Parsed completions fit classification, schema-shaped summaries, and small transformations where one prompt produces one object.

Use [agent output](/sdk/structured-output/agent-output) when the run needs tools, memory, retrieval, hooks, or several turns first. Use an [extractor](/sdk/structured-output/extractors) when fields must be pulled from existing document-like content.
