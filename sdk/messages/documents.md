# Documents

Documents provide model-readable text or files alongside a request. Use them for small, relevant inputs—not as a replacement for retrieval over a large corpus.

## Add text documents to a completion

```ts
const result = await createCompletion(model, {
  input: 'What changed in this release?',
  documents: [
    {
      id: 'release-notes',
      text: releaseNotes,
    },
  ],
})
```

This form is useful when application code already has the text and wants to name the document for one request.

## Add a file to a user message

```ts
import { Message, UserContent } from '@anvia/core'

const message = Message.user([
  UserContent.text('Summarize this report.'),
  UserContent.documentBase64(pdfBase64, 'application/pdf', {
    filename: 'incident-report.pdf',
  }),
])
```

Use `documentUrl(...)` for an accessible URL or `documentBase64(...)` for in-memory file content. Provider limits and supported media types vary.

## Choose documents or retrieval

| Source | Use |
| --- | --- |
| One small document already selected by the application | Request document |
| Many files requiring parsing or chunking | Loader and ingestion flow |
| A large or changing knowledge collection | [Knowledge retrieval](/sdk/knowledges) |

Validate file type, size, ownership, and access before content reaches the model. Do not rely on prompt instructions to hide unauthorized documents.
