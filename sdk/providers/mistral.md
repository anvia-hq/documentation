# Mistral

`@anvia/mistral` connects Mistral to Anvia's provider-neutral model interfaces. The same client can create models for chat completions, embeddings, and OCR while the rest of the application stays on Anvia APIs.

```ts
import { MistralClient } from '@anvia/mistral'

export const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY!,
})
```

## What the client provides

- `completionModel(...)` for agents, direct completions, tools, and structured output
- `embeddingModel(...)` for retrieval and semantic-search vectors
- `ocrModel(...)` for extracting Markdown and page data from documents
- `listModels()` for administrative model inventory

Start with [Setup](/sdk/providers/mistral/setup), then open the guide for the capability you need:

- [Completions](/sdk/providers/mistral/completions)
- [Tools and schemas](/sdk/providers/mistral/tools-and-schemas)
- [Embeddings](/sdk/providers/mistral/embeddings)
- [OCR](/sdk/providers/mistral/ocr)
- [Model listing](/sdk/providers/mistral/model-listing)

## Completion boundary

The current completion adapter declares support for streaming, tools, tool choice, and output schemas. It does not declare chat image input, chat document input, normalized reasoning content, or provider-executed tools.

OCR is therefore a separate document-processing path. Extract a document with `ocrModel(...)`, then decide whether its text should enter a prompt or a knowledge-ingestion pipeline.

Capability declarations describe the adapter contract, not every upstream model ID. Test the exact model and request shape used by the deployment.

## Application responsibilities

The provider package maps requests, normalizes streams and usage, creates embeddings, performs OCR, and lists models. Your application still owns:

- instructions and model selection
- tool authorization and side effects
- tenant and document access
- retries, timeouts, and fallback policy
- retention and observability

Review the [production checklist](/sdk/providers/mistral/production) before shipping.
