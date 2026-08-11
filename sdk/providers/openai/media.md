# Media models

OpenAI media capabilities use separate Anvia model contracts. A completion model that understands an image is not the same object as an image-generation model, and speech generation is separate from transcription.

## Create the models

```ts
import {
  GPT_IMAGE_1,
  TTS_1,
  WHISPER_1,
  OpenAIClient,
} from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

export const imageModel = openai.imageGenerationModel(GPT_IMAGE_1)
export const audioModel = openai.audioGenerationModel(TTS_1)
export const transcriptionModel = openai.transcriptionModel(WHISPER_1)
```

The package also exports documented constants including `GPT_IMAGE_2`, `DALL_E_2`, `DALL_E_3`, and `TTS_1_HD`. Model-name types still accept custom strings, but the configured endpoint must support them.

## Image generation

```ts
import { imageGenerationRequest } from '@anvia/core/image-generation'

const image = await imageGenerationRequest(imageModel)
  .prompt('A minimal isometric illustration of a support workflow')
  .width(1200)
  .height(800)
  .send()

await mediaStore.put({
  bytes: image.image,
  mediaType: image.mediaType ?? 'image/png',
})
```

The OpenAI adapter maps base64 image output to `Uint8Array`. It rejects URL-only image output because Anvia's core image response expects bytes.

## Speech generation

```ts
import { audioGenerationRequest } from '@anvia/core/audio-generation'

const speech = await audioGenerationRequest(audioModel)
  .text('Your incident report is ready.')
  .voice('alloy')
  .speed(1)
  .send()
```

The normalized response contains audio bytes and optional media type. Validate text length, voice, speed, and format before the provider call.

## Transcription

```ts
import { transcriptionRequest } from '@anvia/core/transcription'

const transcript = await transcriptionRequest(transcriptionModel)
  .data(upload.bytes)
  .filename(upload.filename)
  .language('en')
  .send()

console.log(transcript.text)
```

A meaningful filename helps the provider infer the media type. Validate ownership, file type, and size before loading audio; transcripts may contain sensitive information and need their own access and retention policy.

Store media in object storage and pass asset references through application state. Avoid putting raw bytes into agent memory, traces, or event payloads. See [Multimodal](/sdk/advanced/multimodal) for composed media workflows.

