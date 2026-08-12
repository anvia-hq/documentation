# Speech and transcription

**Type:** Pattern

## Outcome

Generate speech from text, save the audio, then transcribe it through Anvia's provider-neutral media
requests. Use this pair to learn both contracts; a real application can adopt either half alone.

## Prerequisites

- Node.js 22 or newer
- `@anvia/core`, `@anvia/openai`, `tsx`, and a server-side `OPENAI_API_KEY`
- Permission to process the source voice or audio

## Implementation

```ts
import { readFile, writeFile } from 'node:fs/promises'
import { audioGenerationRequest } from '@anvia/core/audio-generation'
import { transcriptionRequest } from '@anvia/core/transcription'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })

const speech = await audioGenerationRequest(client.audioGenerationModel())
  .text('Anvia provides provider-neutral audio and transcription contracts.')
  .voice('alloy')
  .speed(1)
  .additionalParams({ response_format: 'mp3' })
  .send()

await writeFile('speech.mp3', speech.audio)

const transcript = await transcriptionRequest(client.transcriptionModel())
  .data(await readFile('speech.mp3'))
  .filename('speech.mp3')
  .prompt('Transcribe the audio exactly.')
  .temperature(0)
  .send()

console.log(transcript.text)
```

## Run and expected behavior

Run `pnpm tsx audio.ts`. It writes `speech.mp3`, then prints a transcript close to the source text.
Exact punctuation can vary. The two calls are billed and fail independently.

## Boundaries

Obtain consent and follow local recording and biometric-voice laws. Limit upload duration, size,
codec, and type; scan files; and never assume a transcript is exact. Do not use generated speech to
impersonate a person or conceal that audio is synthetic.

In production, move long media work to durable jobs, store protected inputs and outputs with
retention and deletion, redact sensitive transcript content, expose job status, and evaluate noisy,
multilingual, accented, and domain-specific audio.

## Source and extensions

Run the
[OpenAI audio cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/04_providers_and_multimodal/08-openai-audio-and-transcription.ts).
Next, transcribe an uploaded file, add timestamps at the provider boundary if supported, or stream
job progress to a UI.

- [Audio generation](/sdk/models/audio-generation)
- [Transcription](/sdk/models/transcription)
