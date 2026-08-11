# OCR models

OCR models extract text and document structure from scanned files and images. The current Anvia OCR adapter is provided by `@anvia/mistral`.

## Create an OCR model

```ts
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
})

export const ocrModel = mistral.ocrModel()
```

## Process a document URL

```ts
const result = await ocrModel.ocr({
  source: {
    type: 'document_url',
    url: 'https://example.com/invoice.pdf',
    documentName: 'invoice.pdf',
  },
  includeImageBase64: false,
})

console.log(result.markdown)
```

OCR sources can be document URLs, image URLs, existing Mistral file IDs, or byte uploads. The normalized response includes combined text and Markdown, page entries, optional annotations, usage, and the raw provider response.

## Production boundary

Validate uploads, media types, sizes, source access, and retention before OCR. Preserve stable source metadata for later citations, and keep raw files in application-owned storage rather than agent memory.
