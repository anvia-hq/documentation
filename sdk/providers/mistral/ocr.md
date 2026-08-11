# OCR

Mistral OCR extracts text and document structure from scanned PDFs and images. It is a separate provider model, not an input mode on `completionModel(...)`.

```ts
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
})

const ocr = mistral.ocrModel()
```

## Process a document URL

```ts
const result = await ocr.ocr({
  source: {
    type: 'document_url',
    url: signedDocumentUrl,
    documentName: 'invoice.pdf',
  },
  tableFormat: 'markdown',
  includeImageBase64: false,
})

console.log(result.markdown)
```

The URL must be reachable by the provider for the duration of the request. Prefer a short-lived signed URL over making a private document permanently public.

## Process local bytes

```ts
import { readFile } from 'node:fs/promises'

const result = await ocr.ocr({
  source: {
    type: 'bytes',
    data: await readFile('./invoice.pdf'),
    filename: 'invoice.pdf',
    expiry: 3600,
    visibility: 'user',
  },
  pages: [0, 1],
  includeImageBase64: false,
})
```

For byte sources, the adapter uploads the file to Mistral with the `ocr` purpose and then processes its returned file ID. `result.uploadedFile` exposes normalized upload metadata. The adapter does not make provider retention decisions for the application, so configure expiry and cleanup according to the document's sensitivity.

OCR also accepts an `image_url` or an existing Mistral `file_id` source. Reject empty byte sources and empty filenames before they reach the provider.

## Use the normalized result

| Field | Meaning |
| --- | --- |
| `text` / `markdown` | Combined page Markdown, suitable for display or the next processing step. |
| `pages` | Normalized page entries with indexes, Markdown, images, and available structural metadata. |
| `documentAnnotation` | Optional provider annotation when requested. |
| `usageInfo` | Provider usage details when returned. |
| `uploadedFile` | Upload metadata for a byte source. |
| `rawResponse` | Original provider response for narrow diagnostics. |

Preserve page boundaries when downstream citations or review need provenance:

```ts
const pages = result.pages.map((page) => ({
  id: `${documentId}#page=${page.index}`,
  text: page.markdown,
  pageIndex: page.index,
}))
```

Leave `includeImageBase64` disabled unless a later step actually needs extracted images. Base64 images can substantially increase response, memory, and trace sizes.

## Validate before use

OCR output can contain recognition errors. Validate totals, dates, identifiers, and other critical values before product writes, and never treat OCR as proof that a document is authentic or that a user may access it.

For deciding when to use OCR, loaders, or model-visible media, continue to the broader [OCR guide](/sdk/advanced/multimodal/ocr).
