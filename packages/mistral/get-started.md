# Get started

Install the adapter with Core:

```sh
pnpm add @anvia/core @anvia/mistral
```

Create the provider client on the server:

```ts
import { AgentBuilder } from '@anvia/core'
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
})

const agent = new AgentBuilder(
  'assistant',
  mistral.completionModel('mistral-large-latest'),
).build()

const result = await agent.prompt('Extract the launch risks.').send()
console.log(result.output)
```

## Create embeddings

```ts
const embeddings = mistral.embeddingModel('mistral-embed', {
  maxBatchSize: 32,
})

const vectors = await embeddings.embedTexts([
  'Password reset links expire after thirty minutes.',
])
```

## Process a document with OCR

```ts
const ocr = mistral.ocrModel()
const result = await ocr.ocr({
  source: {
    type: 'document_url',
    url: 'https://example.com/report.pdf',
    documentName: 'report.pdf',
  },
  tableFormat: 'markdown',
})

console.log(result.markdown)
```

See [OCR](/packages/mistral/ocr) before accepting untrusted URLs or uploading bytes.

## Before production

- Keep provider keys and document access server-side.
- Bound model turns and tool execution.
- Validate OCR source authorization and size before provider upload.
- Keep model IDs explicit and allowlisted.
- Test malformed tool arguments and stream termination.
- Rebuild vector indexes after changing embedding dimensions.
