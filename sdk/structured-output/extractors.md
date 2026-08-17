# Extractors

`extract()` converts existing text into Zod-validated data. It creates a required `submit` tool from the output schema and validates the model's submitted arguments locally.

## 1. Define the schema

```ts
import { extract } from '@anvia/core/extractor'
import { z } from 'zod'

const invoiceSchema = z.object({
  invoiceNumber: z.string(),
  amountDue: z.number(),
  dueDate: z.string().nullable(),
})

```

The model must support tools and required tool choice. Unlike provider-native output schemas, extraction succeeds through a generated tool call named `submit`.

## 2. Extract validated data

```ts
const result = await extract({
  model,
  text: `
    Invoice: INV-123
    Amount due: 49.00
    Due date: 2026-08-31
  `,
  outputSchema: invoiceSchema,
  instructions: 'Dates must use YYYY-MM-DD format.',
})

console.log(result.output.invoiceNumber)
console.log(result.output.amountDue)
```

`result.output` contains the schema output after Zod parsing, including any schema defaults, refinements, or transforms.

## 3. Keep usage and normalized content

The extraction result includes cumulative usage and the successful assistant content:

```ts
const extraction = await extract({
  model,
  text: invoiceText,
  outputSchema: invoiceSchema,
  temperature: 0,
  maxTokens: 300,
})

console.log(extraction.output)
console.log(extraction.usage.totalTokens)
console.log(extraction.content)
```

`rawResponse` remains available for provider-specific diagnostics. Do not expose it directly to clients or treat extraction as conversation [memory](/sdk/memory).

## 4. Retry failed extraction attempts

Extraction does not retry unless retries are configured:

```ts
const invoice = await extract({
  model,
  text: invoiceText,
  outputSchema: invoiceSchema,
  retries: {
    maxAttempts: 2,
    initialDelayMs: 100,
    maxDelayMs: 1_000,
  },
})
```

Each retry is a complete extraction attempt. Missing `submit` calls, invalid submitted data, and retryable provider failures can be tried again. Capability errors are never retried.

After attempts are exhausted, `extract()` throws `ExtractionError`. See [Validation errors](/sdk/structured-output/validation-errors) for a safe handling pattern.
