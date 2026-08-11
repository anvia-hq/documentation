# Image generation models

Image generation models return image bytes from a provider-neutral request. Run them in server routes, workers, or internal tools so credentials remain private.

## Create an image model

```ts
import { GPT_IMAGE_1, OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

export const imageModel = openai.imageGenerationModel(GPT_IMAGE_1)
```

OpenAI, Gemini, and Grok currently provide image-generation adapters.

## Generate an image

```ts
import { writeFile } from 'node:fs/promises'
import { imageGenerationRequest } from '@anvia/core/image-generation'

const response = await imageGenerationRequest(imageModel)
  .prompt('A clean illustration of a document ingestion pipeline')
  .width(1024)
  .height(1024)
  .additionalParams({ output_format: 'png' })
  .send()

await writeFile('document-pipeline.png', response.image)
```

`response.image` contains the first image as a `Uint8Array`; `response.images` contains every returned image.

## Production boundary

Validate prompts and dimensions before generation. Store output in object or media storage with its provider, model, format, and safe prompt metadata. Use a worker when generation is too slow or expensive for the request path.
