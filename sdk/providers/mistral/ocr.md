# OCR

Mistral OCR extracts Markdown and page structure from PDFs and images. It is a separate provider model, not an input mode on `completionModel(...)`.

```ts
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY!,
})

const ocr = mistral.ocrModel({
    modelId: 'mistral-ocr-latest'
})
```

`ocrModel({ modelId })` requires an explicit OCR model ID.

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

The provider must be able to reach the URL for the duration of the request. Prefer a short-lived signed URL over making a private document permanently public.

For an image URL, change the source shape:

```ts
const result = await ocr.ocr({
  source: {
    type: 'image_url',
    url: signedImageUrl,
  },
})
```

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

For byte sources, the adapter first uploads the file with the `ocr` purpose, then processes the returned file ID. Empty bytes and an empty filename are rejected. `result.uploadedFile` contains the upload ID and available metadata.

The adapter does not delete the provider file. Choose `expiry` and `visibility`, and implement any required cleanup according to the document's sensitivity.

To reuse an existing Mistral file, pass its ID directly:

```ts
const result = await ocr.ocr({
  source: {
    type: 'file_id',
    fileId: 'file_123',
  },
})
```

## Use the normalized result

The result provides:

- `text` and `markdown`, both containing the page Markdown joined with blank lines
- `pages`, with each page's index, Markdown, images, and available structural metadata
- optional `model`, `usageInfo`, and `documentAnnotation`
- optional `uploadedFile` for a byte upload
- `rawResponse` for narrow diagnostics

Preserve page boundaries when downstream citations or review need provenance:

```ts
const pages = result.pages.map((page) => ({
  id: `${documentId}#page=${page.index}`,
  text: page.markdown,
  pageIndex: page.index,
}))
```

Available request controls include page selection, extracted-image limits, minimum image size, bounding-box and document annotations, header and footer extraction, table format, and confidence-score granularity. Use `providerOptions` only for provider fields not represented by the normalized request. It cannot replace the adapter's `model` or `document`.

Leave `includeImageBase64` disabled unless a later step needs extracted images; base64 content can significantly increase response, memory, and trace sizes.

OCR can contain recognition errors. Validate totals, dates, identifiers, and other critical values before product writes. Continue to the broader [OCR guide](/sdk/advanced/multimodal/ocr) for choosing between OCR, text extraction, and model-visible media.
