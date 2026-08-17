# Media input

A completion model can inspect images and file documents when its adapter and model capabilities support those content types.

## 1. Send an image URL

```ts
import type { UserMessage } from '@anvia/core'

const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Describe the chart and identify any sudden conversion change.' },
    {
      type: 'image',
      image: { type: 'url', url: signedImageUrl },
      detail: 'high',
    },
  ],
}

const result = await visionAgent.generate({ messages: [prompt] })

if (result.status === 'completed') {
  console.log(result.output)
}
```

The provider fetches a URL source, so it must remain reachable for the request. Prefer a short-lived signed URL over a permanently public asset.

Image `detail` accepts `auto`, `low`, or `high`. Exact support remains provider- and model-specific.

## 2. Send bounded in-memory data

```ts
import { Buffer } from 'node:buffer'
import type { UserMessage } from '@anvia/core'

const imageBase64 = Buffer
  .from(upload.bytes)
  .toString('base64')

const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Read the serial number in this photo.' },
    {
      type: 'image',
      image: { type: 'data', data: imageBase64 },
      mediaType: upload.mediaType,
      detail: 'high',
    },
  ],
}

const result = await visionAgent.generate({ messages: [prompt] })
```

Pass raw base64 without a `data:` URL prefix. Validate ownership, size, and detected media type before encoding. Base64 increases request size, so keep this path bounded.

## 3. Add a document

```ts
const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Summarize the attached incident report.' },
    {
      type: 'file',
      data: { type: 'url', url: signedReportUrl },
      mediaType: 'application/pdf',
      filename: 'incident-report.pdf',
    },
  ],
}

const result = await documentAgent.generate({ messages: [prompt] })
```

Use `{ type: 'data', data: base64 }` for bounded in-memory files and a `text` part for already extracted text.

For large or repeated documents, [extract and chunk text](/sdk/knowledges/load-documents) or run OCR once. Sending the same file on every turn can be slower, more expensive, and harder to cite.

## 4. Expect capability errors

Anvia checks the completion model's `imageInput` and `documentInput` capability flags before sending the request. An unsupported request throws `CompletionCapabilityError`.

Capability support does not establish authenticity or extraction accuracy. Retain the source asset ID, ask for uncertainty where useful, and verify critical values before product writes.

Next, generate [images](/sdk/advanced/multimodal/image).
