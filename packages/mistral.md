# `@anvia/mistral`

Mistral’s provider adapter supplies completion, embeddings, OCR, and model listing. It is useful when one server workflow needs both generative models and document extraction without changing Anvia’s core contracts.

| | |
| --- | --- |
| Support | First-party |
| Version | `0.4.1` |
| Runtime | ESM, server-side JavaScript |
| Peer | `@anvia/core >=0.7.1 <1.0.0` |

## Install

```bash
pnpm add @anvia/mistral @anvia/core
```

## Create a completion model

```ts
import { Agent } from '@anvia/core'
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
})

const agent = new Agent({
  id: 'assistant',
  model: mistral.completionModel('mistral-large-latest'),
})

const result = await agent.prompt('Extract the launch risks from this report.').send()
console.log(result.output)
```

## Capabilities

| Capability | Factory | Default |
| --- | --- | --- |
| Streaming completion | `completionModel()` | `mistral-large-latest` |
| Dense embeddings | `embeddingModel()` | `mistral-embed` |
| OCR | `ocrModel()` | `mistral-ocr-latest` |
| Model inventory | `listModels()` | Provider model list |

Completion supports text, streaming, tools, tool choice, and structured output. Chat image input, chat document input, transcription, audio generation, and image generation are not currently model factories in this package.

## Common patterns

### Extract a remote document with OCR

```ts
const ocr = mistral.ocrModel()

const result = await ocr.ocr({
  source: {
    type: 'document_url',
    url: 'https://example.com/invoice.pdf',
    documentName: 'invoice.pdf',
  },
  tableFormat: 'markdown',
})

console.log(result.markdown)
console.log(result.pages)
```

Byte sources are uploaded before OCR and expose upload metadata in `uploadedFile`. URL and existing file-ID sources avoid that upload step.

### Batch embeddings

```ts
const embeddings = mistral.embeddingModel('mistral-embed', {
  maxBatchSize: 32,
})

const vectors = await embeddings.embedTexts(['first document', 'second document'])
```

## Compatibility

`@anvia/mistral` is ESM and uses the official `@mistralai/mistralai` client. Supply `serverURL` for a custom service or inject a preconfigured `Mistral` client. Exported request/response mapping helpers are available for custom adapters, but they still expect the Anvia and Mistral data shapes documented in the API reference.

## Continue

- [Get started](/packages/mistral/get-started)
- [Capabilities](/packages/mistral/capabilities)
- [Configuration](/packages/mistral/configuration)
- [OCR](/packages/mistral/ocr)
- [Mapping helpers](/packages/mistral/mapping-helpers)
- [API reference](/packages/mistral/api-reference)
- [Releases](/packages/mistral/releases)
- [Mistral SDK guide](/sdk/providers/mistral)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-mistral/CHANGELOG.md)
