# Transcription models

Transcription models convert audio bytes into normalized text. They fit upload processors, meeting notes, call review, and media pipelines.

## Create a transcription model

```ts
import { WHISPER_1, OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

export const transcriptionModel = openai.transcriptionModel(WHISPER_1)
```

OpenAI, Gemini, and Grok currently provide transcription adapters.

## Transcribe audio

```ts
import { readFile } from 'node:fs/promises'
import { transcriptionRequest } from '@anvia/core/transcription'

const audio = await readFile('support-call.wav')

const transcript = await transcriptionRequest(transcriptionModel)
  .data(audio)
  .filename('support-call.wav')
  .language('en')
  .prompt('Transcribe the customer support call exactly.')
  .temperature(0)
  .send()

console.log(transcript.text)
```

The request accepts `Uint8Array` or `ArrayBuffer` audio data. A useful filename helps providers infer the media type.

## Production boundary

Validate file size, media type, and access before reading bytes. Keep raw audio out of memory, traces, and event logs, and protect or redact transcripts before sending them to downstream agents or indexes.
