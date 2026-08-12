# Analyze a PDF

**Type:** Recipe

## Outcome

Attach a PDF to a prompt and ask a document-capable completion model for a concise analysis. Use
direct document input for small, one-off files; prefer loaders, OCR, and retrieval for repeated or
large document workflows.

## Prerequisites

- `@anvia/core`, `@anvia/openai`, and a server-side `OPENAI_API_KEY`
- A model whose `capabilities.documentInput` is true
- A provider-reachable, authorized PDF URL

## Implementation

```ts
import { AgentBuilder } from '@anvia/core/agent'
import { Message, UserContent } from '@anvia/core/completion'
import { OpenAIClient } from '@anvia/openai'

const model = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })
  .completionModel('gpt-5')
if (!model.capabilities.documentInput) throw new Error('Selected model has no document input.')

const analyst = new AgentBuilder('document-analyst', model)
  .instructions('Use only the attached document. Say when evidence is missing.')
  .build()

const response = await analyst.prompt(Message.user([
  UserContent.text('Summarize the document and list its stated action items.'),
  UserContent.documentUrl(
    'https://example.com/private-report.pdf',
    'application/pdf',
    { filename: 'report.pdf' },
  ),
])).send()

console.log(response.output)
```

## Run and expected behavior

Replace the URL, run `pnpm tsx pdf-analysis.ts`, and expect a model-generated summary grounded in
the PDF. A URL the provider cannot fetch, a file over provider limits, or unsupported document input
causes failure.

## Boundaries

Validate scheme, hostname, MIME type, size, page count, ownership, and malware status before making
a URL or upload available. A model summary can omit or misread content and is not evidence that the
document is authentic. Do not expose permanent public links to private files.

In production, use short-lived signed URLs, timeouts, retention controls, and document-specific
evaluations. Extract once with a loader or OCR and index chunks when users will query the same file
repeatedly.

## Source and extensions

Run the
[PDF attachment cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/04_providers_and_multimodal/06-pdf-attachment.ts).
Next, add citations from extracted chunks or use OCR for scanned pages.

- [Multimodal inputs](/sdk/advanced/multimodal/inputs)
- [OCR](./mistral-ocr)
