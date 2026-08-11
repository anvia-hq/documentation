# OCR

OCR recovers text and document structure from scans, images, and PDFs. In Anvia, the current OCR adapter is provided by `@anvia/mistral`; it returns combined text and Markdown plus normalized page entries.

Use OCR when a file does not already contain reliable selectable text. For ordinary text-based PDFs and documents, prefer a [loader](/sdk/knowledges/load-documents) so the application does not pay for unnecessary OCR.

## Create the OCR model

```ts
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
})

const ocr = mistral.ocrModel()
```

## Process an uploaded file

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

Byte sources are uploaded through the Mistral files API before OCR. The response can include uploaded-file metadata so the application can track or clean up the provider-side file according to its retention policy.

OCR also accepts document URLs, image URLs, and existing Mistral file IDs:

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

Use a URL that the provider can reach and that remains valid for the request duration. Do not expose a permanently public asset merely to make OCR possible.

## Preserve page boundaries

Use `result.markdown` for one combined document. Use `result.pages` when citations, review, or knowledge ingestion must retain page-level provenance:

```ts
const pages = result.pages.map((page) => ({
  id: `${document.id}#page=${page.index}`,
  text: page.markdown,
  source: document.source,
  pageIndex: page.index,
}))
```

Page Markdown can still contain recognition mistakes. Validate critical values such as totals, dates, identifiers, and signatures before product writes. OCR is an extraction aid, not proof that a document is authentic or that the current user may access it.

Leave `includeImageBase64` disabled unless a later stage genuinely needs extracted images. Inline images can make responses and traces unexpectedly large; keep originals in application-owned media storage instead.
