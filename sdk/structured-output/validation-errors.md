# Validation errors

Malformed JSON and schema mismatches are expected workflow failures. Map them before they reach product writes or user-facing responses.

## Parsed completions

`createParsedCompletion(...)` rejects when provider output is not valid JSON or does not satisfy the supplied schema.

```ts
try {
  const result = await createParsedCompletion(model, {
    schema: ticketSchema,
    input: message,
  })

  return { status: 'classified', ticket: result.data }
} catch (error) {
  await logger.warn('Ticket classification failed', { error })
  return { status: 'needs_review' }
}
```

Keep the detailed error in protected diagnostics. Return a stable product state rather than raw model output.

## Agent output

Agent output must cross both JSON and schema validation before it is trusted.

```ts
import { z } from 'zod'

try {
  const value = ticketSchema.parse(JSON.parse(response.output))
  return { status: 'classified', ticket: value }
} catch (error) {
  if (error instanceof SyntaxError || error instanceof z.ZodError) {
    return { status: 'needs_review' }
  }

  throw error
}
```

Do not use partially parsed fields after validation fails.

## Extractors

Extractors retry invalid submissions according to `.retries(...)`, then throw `ExtractionError`. Catch that error at the runner and route the source to retry, review, or rejection according to product policy.

Never let unvalidated model output drive billing, permissions, side effects, or durable status changes.
