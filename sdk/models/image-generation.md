# Image generation models

Image generation models create image bytes from a text prompt through a provider-neutral Anvia request. Run generation on a server, worker, or internal tool so provider credentials remain private.

## 1. Create an image model

The provider client owns the provider-specific model implementation.

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey })

export const imageModel = client.imageGenerationModel({ modelId: 'gpt-image-1' })
```

OpenAI, Gemini, and Grok provide v1 RC image-generation adapters. Each provider may support different dimensions, formats, and additional parameters.

## 2. Generate an image

Pass the model, prompt, dimensions, and provider options in one object.

```ts
import { writeFile } from 'node:fs/promises'
import { generateImage } from '@anvia/core/image-generation'
import { imageModel } from './models'

const response = await generateImage({
    prompt: 'A clean product illustration of a document ingestion pipeline',
    model: imageModel,
    width: 1024,
    height: 1024,
    providerOptions: {
        output_format: 'png',
    }
})

await writeFile('document-pipeline.png', response.images[0].data)
```

Width and height default to `1024` and must be positive integers. Provider-specific options remain explicit in `providerOptions`.

## 3. Read the normalized response

The response exposes the first image directly and preserves every returned image.

```ts
console.log({
  firstImageBytes: response.images[0].data.byteLength,
  imageCount: response.images.length,
  mediaType: response.images[0].mediaType,
})

for (const image of response.images) {
  console.log(image.data.byteLength, image.mediaType)
}
```

`rawResponse` remains available when application code needs provider-specific metadata, but avoid returning it directly to clients.

## 4. Design the production boundary

Validate prompts, dimensions, formats, and account-specific limits before invoking the model. Generated media can be slow and expensive, so long-running or bulk work usually belongs in a queue.

Store output in application-owned object or media storage with the provider, model, format, safe prompt metadata, and ownership scope. Do not place raw image bytes in agent memory or routine logs.

Continue with [Audio generation models](/sdk/models/speech-generation).
