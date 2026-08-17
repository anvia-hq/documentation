# Transcription models

Transcription models convert audio bytes into normalized text. They fit upload processors, meeting notes, support-call review, accessibility, and media pipelines.

## 1. Create a transcription model

Construct the provider model in server-side configuration.

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey })

export const transcriptionModel = client.transcriptionModel({ modelId: 'whisper-1' })
```

OpenAI, Gemini, and Grok provide v1 RC transcription adapters. Supported formats, size limits, languages, and optional parameters vary by provider.

## 2. Read the audio bytes

Validate authorization, media type, and size before loading an upload into memory.

```ts
import { readFile } from 'node:fs/promises'

const audioPath = 'support-call.wav'
const audio = await readFile(audioPath)
```

`transcribe()` accepts a `Uint8Array` or `ArrayBuffer`. Empty audio is rejected before the provider is called.

## 3. Transcribe the audio

Pass the bytes first and the model plus filename in the options object.

```ts
import { transcribe } from '@anvia/core/transcription'
import { transcriptionModel } from './models'

const transcript = await transcribe({
    audio: {
        data: audio,
        filename: audioPath
    },
    model: transcriptionModel,
    language: 'en',
    prompt: 'Transcribe the customer support call exactly.',
    temperature: 0
})

console.log(transcript.text)
```

A useful filename helps the provider infer the media type. Language, prompt, temperature, provider parameters, and retry behavior are optional.

## 4. Handle the result safely

The normalized result contains `text` and the raw provider response.

```ts
await transcripts.save({
  recordingId,
  text: transcript.text,
})
```

Audio and transcripts may contain private or regulated information. Define access, retention, deletion, redaction, and downstream-use rules before sending transcripts to agents, indexes, analytics, or logs.

For document and image extraction, continue with [OCR models](/sdk/models/ocr).
