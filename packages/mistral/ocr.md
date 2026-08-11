# OCR

Create an OCR model from the provider client:

```ts
const ocr = mistral.ocrModel('mistral-ocr-latest')
```

## Source types

### Document URL

```ts
await ocr.ocr({
  source: {
    type: 'document_url',
    url: 'https://example.com/invoice.pdf',
    documentName: 'invoice.pdf',
  },
})
```

### Image URL

```ts
await ocr.ocr({
  source: { type: 'image_url', url: 'https://example.com/page.png' },
})
```

### Existing file

```ts
await ocr.ocr({
  source: { type: 'file_id', fileId: 'file_123' },
})
```

### Bytes

```ts
const result = await ocr.ocr({
  source: {
    type: 'bytes',
    data: pdfBytes,
    filename: 'invoice.pdf',
    visibility: 'workspace',
  },
  pages: [0, 1],
  includeImageBase64: false,
  tableFormat: 'markdown',
  extractHeader: true,
})
```

Bytes are uploaded first. Empty data and empty filenames are rejected before the provider call. `result.uploadedFile` records normalized upload metadata and the raw upload response.

## Result shape

`MistralOcrResponse` includes:

- combined `markdown` and equivalent `text`;
- normalized `pages` with images, optional tables, links, headers, footers, dimensions, and confidence scores;
- optional model, usage, and document annotation fields;
- upload metadata when bytes were used;
- the original OCR response as `rawResponse`.

## Security and lifecycle

The adapter does not authorize URLs, enforce file size, scan content, or delete uploaded files. Application code must validate the caller and source, restrict URL schemes and destinations, enforce limits, and decide whether provider files require later cleanup.

Avoid `includeImageBase64` unless the application needs embedded images; it can substantially increase response and trace size. Configure observability capture so OCR content is not exported unintentionally.
