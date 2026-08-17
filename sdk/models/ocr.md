# OCR models

OCR extracts text and document structure from scanned files and images. In the v1 RC, OCR is a provider-specific capability exposed by `@anvia/mistral` rather than a generic `@anvia/core` model helper.

## 1. Install and create the OCR model

Keep the Mistral adapter on the same release-candidate channel as core.

```bash
pnpm add @anvia/core@rc @anvia/mistral@rc
```

```ts
import { MistralClient } from '@anvia/mistral'

const apiKey = process.env.MISTRAL_API_KEY

if (!apiKey) {
  throw new Error('MISTRAL_API_KEY is required')
}

const client = new MistralClient({ apiKey })

export const ocrModel = client.ocrModel({ modelId: 'mistral-ocr-latest' })
```

`ocrModel()` requires a model ID; use an ID supported by the current Mistral OCR API.

## 2. Process a document URL

The source describes where Mistral should read the document.

```ts
import { ocrModel } from './models'

const result = await ocrModel.ocr({
  source: {
    type: 'document_url',
    url: 'https://example.com/invoice.pdf',
    documentName: 'invoice.pdf',
  },
  includeImageBase64: false,
  tableFormat: 'markdown',
})

console.log(result.markdown)
```

Supported sources include document URLs, image URLs, existing Mistral file IDs, and byte uploads.

## 3. Upload bytes for OCR

Byte sources are uploaded through the Mistral file API before OCR runs.

```ts
import { readFile } from 'node:fs/promises'

const invoice = await readFile('invoice.pdf')

const result = await ocrModel.ocr({
  source: {
    type: 'bytes',
    data: invoice,
    filename: 'invoice.pdf',
    visibility: 'user',
  },
  extractHeader: true,
  extractFooter: true,
})
```

The response includes uploaded-file metadata when the adapter performs an upload.

## 4. Read normalized pages

The adapter combines page Markdown while preserving page-level structure.

```ts
console.log(result.text)
console.log(result.markdown)

for (const page of result.pages) {
  console.log(page.index, page.markdown)
}
```

Optional response fields include model, usage information, annotations, uploaded-file metadata, and the raw provider response.

## 5. Protect documents

Validate source access, file type, size, page selection, and retention before OCR. Keep raw files in application-owned storage, preserve stable source metadata for citations, and authorize extracted text before passing it to agents or retrieval indexes.

Continue to [Completions](/sdk/completions) for direct text generation workflows.
