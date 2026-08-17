# Documents

Anvia supports two different document paths: provider-neutral text context on the request, and provider-native file attachments inside a user message. Choose based on whether the application already has readable text or needs the model to inspect a file.

## 1. Attach text context to a completion

Use the `documents` option when application code already has the relevant text:

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'What changed in this release?',
    model,
    documents: [
        {
            id: 'release-notes',
            text: releaseNotes,
            additionalProps: {
                version: '1.0.0-rc.2',
                source: 'release-process',
            },
        },
    ]
})
```

Anvia formats request documents into one tagged text message before the provider call. `id` labels each document and `additionalProps` adds string metadata in stable key order. Because this path is text, it does not require the model's file-document capability.

Use the same `Document` objects in an agent's static `context` array when the text should be available on every agent turn.

## 2. Attach a file to a user message

Use user document content when the provider should receive the actual file:

```ts
import type { UserMessage } from '@anvia/core'

const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Summarize this incident report.' },
    {
      type: 'file',
      data: { type: 'data', data: pdfBase64 },
      mediaType: 'application/pdf',
      filename: 'incident-report.pdf',
    },
  ],
}

const result = await generateCompletion({
  messages: [prompt],
  model,
})
```

Use `{ type: 'url', url }` when the provider can access the URL. Use `{ type: 'data', data }` for bounded in-memory base64 content.

File attachments require `model.capabilities.documentInput`. Anvia checks the declared adapter capability, while the provider still decides which model IDs, media types, file sizes, and URL sources are accepted.

## 3. Choose documents or retrieval

Use request documents for a few small text inputs already selected by the application.

Use message file attachments when the provider must parse a PDF or another supported file directly.

Use extraction, chunking, embeddings, and [knowledge retrieval](/sdk/knowledges) for a large or changing collection. Retrieval selects relevant text instead of sending the entire corpus on every request.

## 4. Enforce the application boundary

Validate file ownership, URL access, MIME type, size, and tenant permissions before content reaches Anvia. Apply redaction and retention rules to extracted text and raw bytes separately. Prompt instructions cannot hide an unauthorized document after it has been sent to the model.

Continue with [Tool call](/sdk/messages/tools).
