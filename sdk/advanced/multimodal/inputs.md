# Media input

A completion model can inspect images and documents when its provider adapter and exact model ID support those content types. This is different from image generation: media input produces an assistant response, not new media bytes.

The [Messages content guide](/sdk/messages/content) defines all content helpers. This page focuses on the application boundaries around using them with real media.

## Send an image URL

```ts
import { Message, UserContent } from '@anvia/core'

const prompt = Message.user([
  UserContent.text(
    'Describe the chart and identify any sudden change in conversion.',
  ),
  UserContent.imageUrl(signedImageUrl, { detail: 'high' }),
])

const response = await visionAgent.prompt(prompt).send()

console.log(response.output)
```

The provider fetches the URL, so it must be reachable for the duration of the request. Prefer a short-lived signed URL over a public asset. Check that the selected model supports image input and the requested `detail` option.

## Send an in-memory image

```ts
import { Buffer } from 'node:buffer'
import { Message, UserContent } from '@anvia/core'

const imageBase64 = Buffer.from(upload.bytes).toString('base64')

const prompt = Message.user([
  UserContent.text('Read the serial number shown in this photo.'),
  UserContent.imageBase64(imageBase64, upload.mediaType, {
    detail: 'high',
  }),
])

const response = await visionAgent.prompt(prompt).send()
```

Pass the raw base64 payload, without a `data:` URL prefix. Validate the upload's ownership, size, and media type before encoding it. Base64 increases payload size, so use it for bounded inputs rather than large files.

## Add a document

Use `UserContent.documentUrl(...)` or `UserContent.documentBase64(...)` when the completion model natively accepts the document type:

```ts
const prompt = Message.user([
  UserContent.text('Summarize the attached incident report.'),
  UserContent.documentUrl(signedReportUrl, 'application/pdf', {
    filename: 'incident-report.pdf',
  }),
])
```

For large files, repeated use, or models without document input, extract the text with a loader or OCR first. Sending a document directly on every turn can be slower, more expensive, and harder to cite than preparing text once.

## Treat model output as a claim

Image understanding can miss small text, infer details that are not present, or fail on unusual layouts. Ask for uncertainty when it matters, retain the source asset ID for review, and validate critical extracted values before a product write. Model access to an image does not prove authenticity or replace application authorization.
