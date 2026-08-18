# Gemini image and transcription models

Image understanding belongs to a completion model. Image creation and audio transcription use separate model factories.

## 1. Choose an image factory

`imageGenerationModel({ api: 'generateContent', modelId })` uses Gemini `generateContent`.

`imageGenerationModel({ api: 'generateImages', modelId })` uses Imagen `generateImages`.

Both satisfy Anvia's `ImageGenerationModel`, but send different Google request shapes.

## 2. Generate with a Gemini-native image model

```ts
import { writeFile } from 'node:fs/promises'
import { generateImage } from '@anvia/core/image-generation'
import {
  GEMINI_2_5_FLASH_IMAGE,
  GeminiClient,
} from '@anvia/gemini'

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY!,
})

const imageModel = gemini.imageGenerationModel({
    api: 'generateContent',
    modelId: GEMINI_2_5_FLASH_IMAGE,
})

const result = await generateImage({
    prompt: 'A minimal diagram of an agent calling two tools',
    model: imageModel,
    width: 1024,
    height: 1024,
    providerOptions: {
        config: {
            imageConfig: {
                aspectRatio: '1:1',
                imageSize: '1K',
            },
        },
    }
})

await writeFile('agent-diagram.png', result.images[0].data)
```

The adapter requests text and image modalities, extracts inline image data, and returns `Uint8Array` bytes. Width and height are reduced to an aspect-ratio string.

Gemini `config` is shallow-merged. Supplying `config.imageConfig` replaces the generated object, so include `aspectRatio` whenever overriding it.

## 3. Generate with Imagen

```ts
import { generateImage } from '@anvia/core/image-generation'
import { IMAGEN_4_GENERATE } from '@anvia/gemini'

const imagen = gemini.imageGenerationModel({
  api: 'generateImages',
  modelId: IMAGEN_4_GENERATE,
})

const result = await generateImage({
    prompt: 'A clean editorial illustration of a retrieval pipeline',
    model: imagen,
    width: 1600,
    height: 900,
    providerOptions: {
        config: {
            aspectRatio: '16:9',
            numberOfImages: 2,
        },
    }
})

console.log(result.images.length)
```

Verify option names and supported aspect ratios against the exact model and API mode.

## 4. Transcribe audio

```ts
import { readFile } from 'node:fs/promises'
import { transcribe } from '@anvia/core/transcription'

const transcriptionModel = gemini.transcriptionModel({
    modelId: 'gemini-3.6-flash'
})

const transcript = await transcribe({
    audio: {
        data: await readFile('uploads/support-call.wav'),
        filename: 'support-call.wav'
    },
    model: transcriptionModel,
    prompt: 'Use the product names Anvia and Acme Cloud.',
    temperature: 0
})

console.log(transcript.text)
```

The adapter adds a fixed exact-transcription instruction and appends the supplied prompt as domain guidance.

Filename extensions map `.wav`, `.aac`, `.ogg`, `.flac`, `.m4a`, and `.opus` to media types. Other names use `audio/mpeg`, so validate uploads before the call.

## 5. Store output deliberately

Persist generated images in object storage. Apply authorization and retention rules to source audio and transcripts, and avoid logging raw provider media responses.
