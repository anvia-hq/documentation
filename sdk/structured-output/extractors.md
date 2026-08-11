# Extractors

Extractors convert existing text into validated records. They use a required generated `submit` tool and can retry missing or invalid submissions.

## Build an extractor

```ts
import { ExtractorBuilder } from '@anvia/core/extractor'
import { z } from 'zod'

const invoiceSchema = z.object({
  invoiceNumber: z.string(),
  amountDue: z.number(),
  dueDate: z.string().nullable(),
})

const invoiceExtractor = new ExtractorBuilder(
  model,
  invoiceSchema,
)
  .instructions('Extract invoice fields from the supplied text.')
  .temperature(0)
  .retries(1)
  .build()
```

Extra instructions should clarify domain rules rather than restating the schema.

## Extract data

```ts
const invoice = await invoiceExtractor.extract(`
  Invoice: INV-123
  Amount due: 49.00
  Due date: 2026-08-31
`)

console.log(invoice.invoiceNumber)
```

`extract(...)` returns schema-validated data. After configured retries are exhausted, a missing submit call or invalid submitted data throws `ExtractionError`.

## Retain usage when needed

```ts
const extraction = await invoiceExtractor.extractWithUsage(invoiceText)

console.log(extraction.data)
console.log(extraction.usage.totalTokens)
```

The returned messages are useful for audit, debugging, or evaluation of the extraction call. They are not normal conversation [memory](/sdk/memory).

Use extractors for invoices, tickets, resumes, transcripts, notes, and other content whose fields already exist. Use [parsed completion](/sdk/structured-output/parsed-completion) when the model is creating a new structured answer.
