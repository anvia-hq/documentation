# Models

Models are provider-backed capability objects. Each model implements one Anvia contract, allowing the rest of the application to depend on the capability instead of a provider SDK.

## Choose the model family

Anvia separates model families because they accept different inputs and return different results:

- [Completion models](/sdk/models/completion) generate assistant content, stream text, call tools, and power agents.
- [Embedding models](/sdk/models/embeddings) turn text into dense vectors for search and retrieval.
- [Image generation models](/sdk/models/image-generation) create image bytes from a prompt.
- [Audio generation models](/sdk/models/speech-generation) create speech bytes from text.
- [Transcription models](/sdk/models/transcription) convert audio bytes into text.
- [OCR models](/sdk/models/ocr) extract text and structure from documents and images.

Provider packages expose only the families supported by their APIs.

## Create models at the provider boundary

Keep credentials and provider-specific configuration in server-side application code. A provider client creates the model objects passed to Anvia helpers and agents.

```ts
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}

const openai = new OpenAIClient({ apiKey })

const completionModel = openai.completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})
const embeddingModel = openai.embeddingModel({
    modelId: 'text-embedding-3-small'
})
const imageModel = openai.imageGenerationModel({ modelId: 'gpt-image-2' })
const audioModel = openai.speechGenerationModel({ modelId: 'tts-1' })
const transcriptionModel = openai.transcriptionModel({ modelId: 'whisper-1' })
```

These objects contain the provider implementation. Core helpers receive them explicitly and coordinate the provider-neutral request.

## Use the model with a core helper

Each model family has a focused helper. For example, a completion model is passed through the `model` option:

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Explain semantic search briefly.',
    model: completionModel,
    instructions: 'Use plain language.'
})

console.log(result.text)
```

The same dependency-injection pattern applies to embeddings, image generation, speech, and transcription.

## Completion capabilities are explicit

Completion models declare the features implemented by that exact adapter:

```ts
console.log(completionModel.capabilities)

// {
//   streaming: true,
//   tools: true,
//   toolChoice: true,
//   imageInput: true,
//   documentInput: true,
//   outputSchema: true,
//   reasoning: true,
//   providerTools: true,
// }
```

The shown values are illustrative. Read the actual object at runtime and smoke test the exact model ID, provider account, region, endpoint, and feature combination used by the product.

## Provider support differs

The v1 RC currently includes these media and data adapters:

- OpenAI: completions, embeddings, image generation, speech, and transcription.
- Gemini: completions, embeddings, image generation, and transcription.
- Grok: completions, image generation, speech, and transcription.
- Mistral: completions, embeddings, and OCR.
- Anthropic: completion models.

Use the [provider capability matrix](/sdk/providers/capability-matrix) to narrow the options, then verify the exact workflow before production.

## Keep model creation centralized

Create provider clients and models in a configuration or dependency module rather than inside product components. Central construction makes credentials, model selection, endpoint overrides, and tests easier to control.

Continue with [Completion models](/sdk/models/completion).
