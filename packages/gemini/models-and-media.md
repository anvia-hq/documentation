# Models and media

Gemini exposes separate model factories for completion, embeddings, two image APIs, and transcription.

## Native Gemini images

```ts
import { GEMINI_2_5_FLASH_IMAGE, GeminiClient } from '@anvia/gemini'

const model = new GeminiClient({ apiKey })
    .imageGenerationModel({
    api: 'generateContent',
    modelId: GEMINI_2_5_FLASH_IMAGE,
})

const result = await model.imageGeneration({
  prompt: 'A minimal technical illustration of an agent pipeline',
  width: 1024,
  height: 1024,
})
```

This path calls `generateContent` with text and image response modalities. It scans candidate inline parts, decodes all returned images, and rejects invalid or absent base64 data.

## Imagen

```ts
import { IMAGEN_4_GENERATE } from '@anvia/gemini'

const model = gemini.imageGenerationModel({
  api: 'generateImages',
  modelId: IMAGEN_4_GENERATE,
})
```

Imagen calls `generateImages` and reads `generatedImages[].image.imageBytes`. Keep it separate from the native Gemini factory; their request options are not interchangeable.

Both image adapters reduce requested dimensions into an aspect-ratio string. Use `providerOptions.config` for supported provider controls.

## Transcription

```ts
const transcript = await gemini.transcriptionModel({
    modelId: 'gemini-2.5-flash'
})
  .transcription({
    data: audioBytes,
    filename: 'interview.ogg',
    prompt: 'Preserve speaker names and technical terms.',
  })
```

The adapter adds a transcription-specific system instruction and includes the optional prompt. Supported extension mapping includes WAV, AAC, OGG, FLAC, M4A, and Opus; other filenames default to MPEG.

## Model IDs

Known unions are autocomplete lists, not an availability guarantee. The broader `ModelId` type accepts custom strings for new or platform-specific IDs. Use `listModels()` for inventory and an application allowlist for production selection.

## Boundaries

The package does not implement text-to-speech as an Anvia audio generation model, even though known completion IDs may include TTS previews. It also does not expose a live audio session. Call a native API directly if the normalized model contract does not fit the desired interaction.
