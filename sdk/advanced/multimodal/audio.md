# Audio generation

Audio generation turns text into audio bytes through an `AudioGenerationModel`. Use it for narration, accessibility, spoken summaries, and media previews.

Create the provider model as shown in [Audio generation models](/sdk/models/audio-generation), then pass it into the server-side workflow that owns voice and format policy.

## Generate speech

```ts
import { audioGenerationRequest } from '@anvia/core/audio-generation'

const response = await audioGenerationRequest(audioModel)
  .text('Your incident summary is ready for review.')
  .voice('alloy')
  .speed(1)
  .additionalParams({ response_format: 'mp3' })
  .send()
```

The normalized response contains `audio` as a `Uint8Array`, an optional `mediaType`, and the raw provider response. Set a voice explicitly in production; the core builder cannot choose a product-appropriate voice for you.

Provider-specific formats and synthesis settings belong in `additionalParams(...)`. Validate those settings against an allow-list before they reach the request builder.

## Control generated scripts

Do not send unbounded model output directly into speech generation. Validate the final script after any completion or agent stage:

```ts
import { z } from 'zod'

const SpeechRequest = z.object({
  text: z.string().min(1).max(3_000),
  voice: z.enum(['alloy', 'verse', 'aria']),
})

const input = SpeechRequest.parse(requestedSpeech)

const speech = await audioGenerationRequest(audioModel)
  .text(input.text)
  .voice(input.voice)
  .speed(1)
  .additionalParams({ response_format: 'mp3' })
  .send()
```

The allow-list is application policy, not a universal provider list. Use only voices supported by the configured model and approved for your product.

## Store and serve the result

Persist the audio in object storage or a media service, then return an asset ID or short-lived URL:

```ts
const asset = await mediaStore.put({
  bytes: speech.audio,
  mediaType: speech.mediaType ?? 'audio/mpeg',
  metadata: {
    voice: input.voice,
    model: audioModel.defaultModel ?? 'unknown',
  },
})
```

Keep raw audio out of sessions, traces, and event logs. Use a durable worker for long scripts, bulk generation, or workflows that need progress and retries. When a product imitates or represents a real person, add the required consent, disclosure, and review controls outside the model request.
