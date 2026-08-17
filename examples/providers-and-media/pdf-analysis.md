# Analyze a PDF

**Type:** Recipe

## Outcome

Attach a PDF to a prompt and ask a document-capable completion model for a concise analysis. Use
direct document input for small, one-off files; prefer text extraction, OCR, and retrieval for repeated or
large document workflows.

## Prerequisites

- `@anvia/core`, `@anvia/openai`, and a server-side `OPENAI_API_KEY`
- A model whose `capabilities.documentInput` is true
- A provider-reachable, authorized PDF URL

## Implementation

```ts
import { Agent } from '@anvia/core/agent'
import type { UserMessage } from '@anvia/core/completion'
import { OpenAIClient } from '@anvia/openai'

const model = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
    .completionModel({
    modelId: 'gpt-5.5',
    api: "responses"
})
if (!model.capabilities.documentInput) throw new Error('Selected model has no document input.')

const analyst = new Agent({
  id: 'document-analyst',
  model: model,
  instructions: 'Use only the attached document. Say when evidence is missing.',
})

const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Summarize the document and list its stated action items.' },
    {
      type: 'file',
      data: { type: 'url', url: 'https://example.com/private-report.pdf' },
      mediaType: 'application/pdf',
      filename: 'report.pdf',
    },
  ],
}

const response = await analyst.generate({ messages: [prompt] })

if (response.status === 'completed') {
  console.log(response.output)
}
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
evaluations. Extract once with `extractPdfText()` or OCR and index chunks when users will query the same file
repeatedly.

## Source and extensions

Run the
[PDF attachment cookbook](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/04_providers_and_multimodal/06-pdf-attachment.ts).
Next, add citations from extracted chunks or use OCR for scanned pages.

- [Multimodal inputs](/sdk/advanced/multimodal/inputs)
- [OCR](./mistral-ocr)
