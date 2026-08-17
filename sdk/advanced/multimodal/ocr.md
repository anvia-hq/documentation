# OCR

OCR recovers text and structure from scans, images, and PDFs. The v1 OCR adapter is provided by `@anvia/mistral` rather than a provider-neutral core contract.

For documents with reliable selectable text, prefer [text extraction](/sdk/knowledges/load-documents) and avoid unnecessary OCR cost.

## 1. Create the model

```ts
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY!,
})

const ocr = mistral.ocrModel({ modelId: 'mistral-ocr-latest' })
```

Pass an explicit model ID to `ocrModel(modelId)` when the application must pin a version.

## 2. Process uploaded bytes

```ts
const result = await ocr.ocr({
  source: {
    type: 'bytes',
    data: upload.bytes,
    filename: upload.filename,
  },
  tableFormat: 'markdown',
  includeImageBase64: false,
})

console.log(result.markdown)
```

Byte sources are uploaded through the Mistral files API before OCR. `result.uploadedFile` records normalized upload metadata when that path is used. The adapter does not delete the provider-side file; apply the retention policy your application requires.

## 3. Use URL or existing-file sources

```ts
const result = await ocr.ocr({
  source: {
    type: 'document_url',
    url: signedDocumentUrl,
    documentName: 'invoice.pdf',
  },
  includeImageBase64: false,
})
```

Other source variants are `image_url` and `file_id`. A URL must remain reachable by the provider for the request duration; prefer a short-lived signed URL.

## 4. Preserve page provenance

`result.text` and `result.markdown` contain the combined page Markdown. Use `result.pages` for page-level review or knowledge ingestion:

```ts
const pages = result.pages.map((page) => ({
  id: `${document.id}#page=${page.index}`,
  text: page.markdown,
  source: document.source,
  pageIndex: page.index,
}))
```

Normalized pages may also include images, tables, hyperlinks, header, footer, dimensions, and confidence data when returned by the provider.

Keep `includeImageBase64` disabled unless a later stage needs extracted images. Verify totals, dates, identifiers, and signatures before product writes. OCR neither proves authenticity nor grants access to the source.

Next, return media through [tool results](/sdk/advanced/multimodal/tool-results).
