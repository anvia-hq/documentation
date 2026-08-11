# Mistral

`@anvia/mistral` adapts Mistral APIs to Anvia's provider-neutral model contracts. Use one client to create completion, embedding, and OCR models without coupling agents or retrieval code to the Mistral SDK.

```ts
import { MistralClient } from '@anvia/mistral'

export const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
})
```

## Choose a capability

| Workflow | Factory | Continue with |
| --- | --- | --- |
| Agents and direct completions | `completionModel(...)` | [Completions](/sdk/providers/mistral/completions) |
| Tool use and structured results | `completionModel(...)` | [Tools and schemas](/sdk/providers/mistral/tools-and-schemas) |
| Retrieval and semantic search | `embeddingModel(...)` | [Embeddings](/sdk/providers/mistral/embeddings) |
| Scanned PDFs and document images | `ocrModel(...)` | [OCR](/sdk/providers/mistral/ocr) |
| Provider inventory | `listModels()` | [Model listing](/sdk/providers/mistral/model-listing) |

OCR is a separate document-processing capability. It does not make a Mistral completion model accept image or document attachments. Extract the document first, then decide whether its text should enter a prompt or a knowledge-ingestion pipeline.

## Completion capabilities

The current adapter declares streaming, tools, tool choice, and output-schema support. It does not declare chat image input, chat document input, or normalized reasoning content.

Capability declarations describe the adapter contract, not every upstream model. Test the exact model ID and request shape used in production.

## Keep the boundary small

The provider package owns request mapping, stream normalization, usage normalization, embeddings, OCR, and model listing. The application still owns instructions, tool authorization, tenant scope, document retention, retry policy, and provider fallback.

Start with [Setup](/sdk/providers/mistral/setup), then add only the capability models the workflow needs. Review the [production checklist](/sdk/providers/mistral/production) before shipping.
