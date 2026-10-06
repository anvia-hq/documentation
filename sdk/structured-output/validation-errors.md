# Validation errors

Invalid JSON and schema mismatches are expected model-workflow failures. Convert them into a stable product state before any billing, permission, write, or other side effect runs.

## 1. Handle parsed-completion failures

`generateCompletion()` rejects when the model lacks output-schema support, the provider call fails, or structured output cannot be parsed or validated. JSON and schema failures throw `CompletionStructuredOutputError`; the schema library's issues are the `cause` of the schema phase, not the thrown value. Schemas that validate asynchronously are rejected the same way, in the `schema` phase:

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

## 4. Handle invalid provider output

`CompletionProviderOutputError` is a provider contract failure, separate from validating the final
application output schema. Import it and `COMPLETION_PROVIDER_OUTPUT_ERROR_CODE` from `@anvia/core`
or `@anvia/core/completion`. Its `code` is `ANVIA_COMPLETION_PROVIDER_OUTPUT`.

| `kind` | Meaning |
| --- | --- |
| `malformed-tool-arguments`, `invalid-tool-arguments` | Arguments cannot be parsed or represented as strict JSON. |
| `invalid-response`, `invalid-stream-event` | A normalized provider response/event violates the contract. |
| `incomplete-stream`, `incomplete-tool-call`, `invalid-tool-call` | A stream/call did not finish correctly or cannot be consumed safely. |
| `truncated-tool-call` | Tool arguments were cut off; `finishReason` is `length`. |
| `filtered-tool-call` | Tool call was filtered; `finishReason` is `content-filter`. |

The error exposes `kind`, optional `toolCallId`, `finishReason`, and authoritative `usage`. It
intentionally omits raw tool arguments. Keep call IDs and even normalized diagnostic fields within
your application's logging policy; do not attach the provider response as a fallback.

This complete offline example exercises the provider-output catch boundary and retry budget:

```ts anvia-check provider-error-example
import { CompletionProviderOutputError, generateCompletion } from '@anvia/core'
import type { CompletionModel } from '@anvia/core/completion'

let attempts = 0
const model: CompletionModel = {
  provider: 'offline', modelId: 'broken-tool-call',
  capabilities: { streaming: false, tools: true, toolChoice: true, outputSchema: false,
    imageInput: false, documentInput: false, reasoning: false },
  async completion() {
    attempts++
    throw new CompletionProviderOutputError({ kind: 'malformed-tool-arguments' })
  },
}
let diagnostic: { code: string; kind: string; attempts: number } | undefined
try {
  await generateCompletion({ model, prompt: 'Run a synthetic test',
    retries: { maxAttempts: 2, initialDelayMs: 0, maxDelayMs: 0 } })
} catch (error) {
  if (!(error instanceof CompletionProviderOutputError)) throw error
  diagnostic = { code: error.code, kind: error.kind, attempts }
}
console.log(diagnostic) // malformed-tool-arguments after two attempts
```

Direct completions need opt-in retries. The default retry predicate accepts malformed/invalid tool
arguments, invalid stream events, incomplete streams/calls, invalid calls, and truncated calls.
It excludes `invalid-response` and `filtered-tool-call`. A custom `shouldRetry` changes the
predicate but not cancellation, attempt limits, or the streaming rule: once provider progress is
exposed, the invocation is not retried. Increasing a budget does not fix deterministic invalid
output. See [agent retry boundaries](/sdk/agents/errors-and-limits#_4-retry-transient-model-failures)
and [stream error handling](/sdk/streaming/errors-and-cancellation).
