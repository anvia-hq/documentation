# Validation errors

Invalid JSON and schema mismatches are expected model-workflow failures. Convert them into a stable product state before any billing, permission, write, or other side effect runs.

## 1. Handle parsed-completion failures

`generateCompletion()` rejects when the model lacks output-schema support, the provider call fails, or structured output cannot be parsed or validated. JSON and schema failures throw `CompletionStructuredOutputError`; Zod issues are the `cause` of the schema phase, not the thrown value:

```ts
import { CompletionStructuredOutputError, generateCompletion } from '@anvia/core'

try {
  const result = await generateCompletion({
      prompt: message,
      model,
      outputSchema: ticketSchema
  })

  return { status: 'classified', ticket: result.output }
} catch (error) {
  if (error instanceof CompletionStructuredOutputError) {
    await logger.warn('Ticket classification failed', {
      phase: error.phase,
      finishReason: error.finishReason,
      outputLength: error.outputLength,
      cause: error.cause,
    })
  } else {
    await logger.warn('Ticket classification failed', { error })
  }

  return { status: 'needs_review' }
}
```

`phase` is `'parse' | 'schema' | 'truncated' | 'content-filter'`. The error also exposes `outputLength`, `usage`, `finishReason`, and `providerFinishReason` for structured diagnostics. Keep detailed errors in protected diagnostics. Do not expose provider responses, source documents, or sensitive field values in a public error message.

## 2. Handle agent structured-output failures

An agent `outputSchema` is validated by the runtime before a `response` outcome is returned. Do not parse `response.output` a second time. Invalid structured output rejects the run with `AgentStructuredOutputError`:

```ts
import { AgentStructuredOutputError } from '@anvia/core'

try {
  const result = await agent.generate({
      prompt: message
  })

  if (result.type !== 'response') {
    return handleNonResponse(result)
  }

  return { status: 'classified', ticket: result.output }
} catch (error) {
  if (error instanceof AgentStructuredOutputError) {
    await logger.warn('Agent structured output failed', {
      phase: error.phase,
      attempt: error.attempt,
      maxAttempts: error.maxAttempts,
      cause: error.cause,
    })
    return { status: 'needs_review' }
  }

  throw error
}
```

The runtime first retries invalid output within the agent's `retries` budget by appending a correction user prompt to the conversation, so `attempt` is the failed attempt within a budget of `maxAttempts`. The error also exposes `outputLength`, `normalizedLength`, `outputFormat` (`'raw' | 'json-fence' | 'unlabeled-fence'`), `attemptUsage`, `usage`, and `providerFinishReason`.

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

The error also exposes `attempts`, the number of extraction attempts made, and `usage`, the cumulative token usage across attempts.

Choose whether a failed item should be retried later, reviewed by a person, or rejected according to product policy. Never persist unvalidated model output as a fallback.
