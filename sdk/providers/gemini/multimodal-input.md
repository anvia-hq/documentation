# Multimodal input

Gemini completions accept Anvia image and document content in user messages. The adapter converts base64 data to Google inline data and URLs to Google file-data references.

## Send an image and a PDF

```ts
import { readFile } from 'node:fs/promises'
import type { UserMessage } from '@anvia/core'

const screenshot = await readFile('uploads/checkout.png')
const report = await readFile('uploads/incident.pdf')

const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Compare the screenshot with the incident report.' },
    {
      type: 'image',
      image: { type: 'data', data: screenshot.toString('base64') },
      mediaType: 'image/png',
    },
    {
      type: 'file',
      data: { type: 'data', data: report.toString('base64') },
      mediaType: 'application/pdf',
      filename: 'incident.pdf',
    },
  ],
}

const result = await agent.generate({ messages: [prompt] })

if (result.status === 'completed') {
  console.log(result.output)
}
```

Validate file ownership, size, and detected media type before reading or encoding an upload. Base64 increases memory and payload size, so large assets should use a supported provider file URI or a bounded preprocessing pipeline.

## Input mapping

Text becomes a Google `text` part. Base64 images and documents become `inlineData` with the supplied media type. Image URLs become `fileData` with a type inferred from the URL path. Document URLs become `fileData` with the supplied type.

The adapter does not upload or download URL content. The URI must be accessible and accepted by the configured Gemini API or Vertex deployment. Prefer base64 for small controlled assets and provider-native file or Cloud Storage URIs for larger media when the selected API supports them.

## Media capability depends on the model

Anvia represents non-image attachments through document content. The supplied media type may identify a PDF, audio file, video, or another format, but the selected Gemini model must support that input type.

Keep an application allow-list for accepted MIME types and test each enabled format. Do not treat `documentInput: true` as permission to forward arbitrary uploads.

## Conversation-history limits

The adapter currently rejects image content in assistant history. Store generated images or prior assistant assets in application storage and reintroduce an authorized asset as user input when a later turn needs it.

Multimodal tool-result images are not sent to Gemini as image parts through this adapter. They are represented by a media-type placeholder in the function response, while text tool-result content remains visible to the model. Return a controlled asset reference or metadata when the model must reason about a tool-produced image in a later turn.

## Keep media outside memory and traces

Store media bytes in object storage and keep authorized references in application state. Avoid placing raw base64 in memory, logs, traces, or long-lived event payloads. Redact or disable payload capture when requests may contain private documents, screenshots, audio, or video.
