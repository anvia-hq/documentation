# Multimodal input

Gemini completions accept Anvia image and document content in user messages. The adapter converts base64 data to Google inline data and URLs to Google file-data references.

## Send an image and a PDF

```ts
import { readFile } from 'node:fs/promises'
import { Message, UserContent } from '@anvia/core'

const screenshot = await readFile('uploads/checkout.png')
const report = await readFile('uploads/incident.pdf')

const prompt = Message.user([
  UserContent.text(
    'Compare the screenshot with the incident report.',
  ),
  UserContent.imageBase64(
    screenshot.toString('base64'),
    'image/png',
  ),
  UserContent.documentBase64(
    report.toString('base64'),
    'application/pdf',
    { filename: 'incident.pdf' },
  ),
])

const response = await agent.prompt(prompt).send()
console.log(response.output)
```

Validate file ownership, size, and detected media type before reading or encoding an upload. Base64 increases memory and payload size, so large assets should use a supported provider file URI or a bounded preprocessing pipeline.

## Input mapping

| Anvia content | Google request part |
| --- | --- |
| Text | `text` |
| Base64 image | `inlineData` with the supplied media type |
| Image URL | `fileData`; image type is inferred from the URL path |
| Text document | `text` |
| Base64 document | `inlineData` with the supplied media type |
| Document URL | `fileData` with the supplied media type |

The adapter does not upload or download URL content. The URI must be accessible and accepted by the configured Gemini API or Vertex deployment. Prefer base64 for small controlled assets and provider-native file or Cloud Storage URIs for larger media when the selected API supports them.

## Media capability depends on the model

Anvia represents non-image attachments through document content. The supplied media type may identify a PDF, audio file, video, or another format, but the selected Gemini model must support that input type.

Keep an application allow-list for accepted MIME types and test each enabled format. Do not treat `documentInput: true` as permission to forward arbitrary uploads.

## Conversation-history limits

The adapter currently rejects image content in assistant history. Store generated images or prior assistant assets in application storage and reintroduce an authorized asset as user input when a later turn needs it.

Multimodal tool-result images are not sent to Gemini as image parts through this adapter. They are represented by a media-type placeholder in the function response, while text tool-result content remains visible to the model. Return a controlled asset reference or metadata when the model must reason about a tool-produced image in a later turn.

## Keep media outside memory and traces

Store media bytes in object storage and keep authorized references in application state. Avoid placing raw base64 in memory, logs, traces, or long-lived event payloads. Redact or disable payload capture when requests may contain private documents, screenshots, audio, or video.
