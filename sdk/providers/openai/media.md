# OpenAI media models

OpenAI image generation, speech generation, and transcription use separate Anvia model contracts.

## 1. Create capability-specific models

```ts
import {
  GPT_IMAGE_1,
  TTS_1,
  WHISPER_1,
  OpenAIClient,
} from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

const imageModel =
  openai.imageGenerationModel({
      modelId: GPT_IMAGE_1
  })
const audioModel =
  openai.speechGenerationModel({
      modelId: TTS_1
  })
const transcriptionModel =
  openai.transcriptionModel({
      modelId: WHISPER_1
  })
```

The package also exports known constants such as `GPT_IMAGE_2`, `DALL_E_2`, `DALL_E_3`, and `TTS_1_HD`. Model-name types accept custom IDs, but the endpoint must implement them.

## 2. Generate image bytes

```ts
import { generateImage } from '@anvia/core/image-generation'

const image = await generateImage({
    prompt: 'A minimal isometric illustration of a support workflow',
    model: imageModel,
    width: 1200,
    height: 800,
    retries: { maxAttempts: 3 }
})

await mediaStore.put({
  bytes: image.images[0].data,
  mediaType: image.images[0].mediaType ?? 'image/png',
})
```

The adapter maps base64 output to `Uint8Array`. It rejects URL-only image responses because the Core image response contract requires bytes.

Provider `providerOptions` are applied after normalized fields, so keep them in trusted allow-listed configuration.

## 3. Generate speech

```ts
import { generateSpeech } from '@anvia/core/speech-generation'

const speech = await generateSpeech({
    text: 'Your incident report is ready.',
    model: audioModel,
    voice: 'alloy',
    speed: 1
})
```

The adapter returns audio bytes and a media type inferred from the requested response format. Validate script length, voice, speed, and format before the provider call.

## 4. Transcribe audio

```ts
import { transcribe } from '@anvia/core/transcription'

const transcript = await transcribe({
    audio: {
        data: upload.bytes,
        filename: upload.filename
    },
    model: transcriptionModel,
    language: 'en',
    retries: { maxAttempts: 3 }
})

console.log(transcript.text)
```

A meaningful filename helps the provider infer the media type. Validate ownership, type, and size before loading audio.

## 5. Store media outside runtime state

Persist media in object storage and pass asset references through application state. Keep raw bytes out of memory, traces, and event payloads. Apply access and retention policy to transcripts and generated assets.

See [Multimodal workflows](/sdk/advanced/multimodal) for composition guidance.
