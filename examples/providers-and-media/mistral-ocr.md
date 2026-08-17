# Mistral OCR

**Type:** Recipe

## Outcome

Extract page Markdown from a remote PDF with Mistral OCR. Use OCR for scans and images without
reliable selectable text; use ordinary text or PDF extraction for text-based documents when possible.

## Prerequisites

- `pnpm add @anvia/mistral @anvia/core`
- A server-side `MISTRAL_API_KEY`
- An authorized URL that Mistral can fetch

## Implementation

```ts
import { MistralClient } from '@anvia/mistral'

const apiKey = process.env.MISTRAL_API_KEY
if (!apiKey) throw new Error('Set MISTRAL_API_KEY.')

const ocr = new MistralClient({ apiKey }).ocrModel({ modelId: 'mistral-ocr-latest' })
const result = await ocr.ocr({
  source: {
    type: 'document_url',
    url: 'https://example.com/authorized-invoice.pdf',
    documentName: 'invoice.pdf',
  },
  tableFormat: 'markdown',
  extractHeader: true,
  extractFooter: true,
})

console.log('pages:', result.pages.length)
console.log(result.markdown)
```

For local bytes, use `{ type: 'bytes', data, filename }`; the adapter uploads the file for OCR and
returns upload metadata as `uploadedFile`.

## Run and expected behavior

Run `pnpm tsx mistral-ocr.ts`. The normalized response contains combined `text` and `markdown`, page
entries, optional model and usage metadata, and the raw provider response. OCR quality varies with
scan clarity and layout.

## Boundaries

Validate authorization, URL scheme and host, file size, MIME type, page count, and malware status.
Use short-lived signed URLs and avoid embedded image base64 unless required because it can greatly
increase response and trace size. OCR is not proof of document authenticity; verify totals, dates,
identifiers, and signatures before writes.

In production, use durable workers for large documents, track and clean up uploaded provider files
under your retention policy, encrypt stored results, restrict trace payload capture, and keep a human
review path for critical fields.

## Source and extensions

The current source contract and tested sources are in
[`MistralOcrModel`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-mistral/src/mistral/ocr.ts)
and its [OCR tests](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-mistral/test/ocr.test.ts).
Next, process selected pages, upload bytes, or feed reviewed Markdown into retrieval.

- [Mistral OCR](/sdk/providers/mistral/ocr)
- [OCR guidance](/sdk/advanced/multimodal/ocr)
