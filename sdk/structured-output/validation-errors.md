# Validation errors

Invalid JSON and schema mismatches are expected model-workflow failures. Convert them into a stable product state before any billing, permission, write, or other side effect runs.

## 1. Handle parsed-completion failures

`generateCompletion()` rejects when the model lacks output-schema support, the provider call fails, the returned text is invalid JSON, or local Zod validation fails:

```ts
import { z } from 'zod'

try {
  const result = await generateCompletion({
      prompt: message,
      model,
      outputSchema: ticketSchema
  })

  return { status: 'classified', ticket: result.output }
} catch (error) {
  if (error instanceof z.ZodError) {
    await logger.warn('Ticket schema validation failed', {
      issues: error.issues,
    })
  } else {
    await logger.warn('Ticket classification failed', { error })
  }

  return { status: 'needs_review' }
}
```

Keep detailed errors in protected diagnostics. Do not expose provider responses, source documents, or sensitive field values in a public error message.

## 2. Validate agent output safely

Agent output crosses a JSON boundary and then a schema boundary:

```ts
function parseTicketOutput(output: string) {
  let json: unknown

  try {
    json = JSON.parse(output)
  } catch {
    return { ok: false as const, reason: 'invalid_json' }
  }

  const parsed = ticketSchema.safeParse(json)
  if (!parsed.success) {
    return {
      ok: false as const,
      reason: 'invalid_schema',
      issues: parsed.error.issues,
    }
  }

  return { ok: true as const, data: parsed.data }
}
```

Do not use partially parsed fields when the complete object fails validation.

## 3. Handle extractor failures

Extractors wrap exhausted attempts in `ExtractionError` and retain the final failure as `cause`:

```ts
import { ExtractionError } from '@anvia/core/extractor'

try {
  const result = await extract({
    model,
    text: invoiceText,
    outputSchema: invoiceSchema,
    retries: { maxAttempts: 2 },
  })

  return { status: 'extracted', invoice: result.output }
} catch (error) {
  if (error instanceof ExtractionError) {
    await queueForReview({ sourceId, reason: error.message })
    return { status: 'needs_review' }
  }

  throw error
}
```

Choose whether a failed item should be retried later, reviewed by a person, or rejected according to product policy. Never persist unvalidated model output as a fallback.
