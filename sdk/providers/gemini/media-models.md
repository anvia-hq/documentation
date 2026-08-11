# Image and transcription

Gemini media capabilities use separate Anvia model contracts. Image understanding belongs to a completion model; image creation and audio transcription use their own factories.

## Choose an image factory

`GeminiClient` exposes two image-generation paths:

| Factory | Google operation | Default model constant |
| --- | --- | --- |
| `imageGenerationModel(...)` | Gemini `models.generateContent` | `GEMINI_2_5_FLASH_IMAGE` |
| `imagenGenerationModel(...)` | Imagen `models.generateImages` | `IMAGEN_4_GENERATE` |

Use the factory that matches the selected model family. They return the same Anvia image-generation contract but send different Google request shapes.

## Generate with a native Gemini image model

```ts
import { writeFile } from 'node:fs/promises'
import { imageGenerationRequest } from '@anvia/core/image-generation'
import {
  GEMINI_2_5_FLASH_IMAGE,
  GeminiClient,
} from '@anvia/gemini'

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY,
})

const imageModel = gemini.imageGenerationModel(
  GEMINI_2_5_FLASH_IMAGE,
)

const result = await imageGenerationRequest(imageModel)
  .prompt('A minimal diagram of an agent calling two tools')
  .width(1024)
  .height(1024)
  .additionalParams({
    config: {
      imageConfig: { imageSize: '1K' },
    },
  })
  .send()

await writeFile('agent-diagram.png', result.image)
```

The adapter requests text and image response modalities, extracts inline image bytes, and returns them as `Uint8Array`. Width and height are reduced to an aspect ratio, such as `1024 × 768` becoming `4:3`.

## Generate with Imagen

```ts
import { IMAGEN_4_GENERATE } from '@anvia/gemini'

const imagen = gemini.imagenGenerationModel(IMAGEN_4_GENERATE)

const result = await imageGenerationRequest(imagen)
  .prompt('A clean editorial illustration of a retrieval pipeline')
  .width(1600)
  .height(900)
  .additionalParams({
    config: {
      numberOfImages: 2,
    },
  })
  .send()

console.log(result.images.length)
```

Provider-specific configuration is forwarded to Google's image operation. Confirm option names against the selected model and API mode. The adapter uses a shallow merge, so a supplied `config.imageConfig` replaces the generated `imageConfig` object; include `aspectRatio` there when overriding it.

## Transcribe audio

```ts
import { readFile } from 'node:fs/promises'
import { transcriptionRequest } from '@anvia/core/transcription'

const transcriptionModel = gemini.transcriptionModel(
  'gemini-2.5-flash',
)

const transcript = await transcriptionRequest(transcriptionModel)
  .data(await readFile('uploads/support-call.wav'))
  .filename('support-call.wav')
  .prompt('Use the product names Anvia and Acme Cloud.')
  .temperature(0)
  .send()

console.log(transcript.text)
```

The adapter sends the audio bytes as inline data to Gemini `generateContent` with a transcription instruction. A prompt adds domain terminology; it does not replace the instruction to transcribe exactly.

The filename determines the outgoing MIME type for `.wav`, `.aac`, `.ogg`, `.flac`, `.m4a`, and `.opus`. Other filenames fall back to `audio/mpeg`, so validate and normalize uploads before calling the model.

## Store outputs deliberately

Persist generated images in object storage instead of agent memory or traces. Apply authorization and retention rules to source audio and transcripts, and avoid logging raw provider responses when they may contain media or sensitive text.
