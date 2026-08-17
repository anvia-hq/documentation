# Audio generation

`generateSpeech()` turns text into audio bytes through an `SpeechGenerationModel`.

## 1. Generate speech

```ts
import { generateSpeech } from '@anvia/core/speech-generation'

const speech = await generateSpeech({
    text: 'Your incident summary is ready for review.',
    model: audioModel,
    voice: 'alloy',
    speed: 1,
    providerOptions: {
        response_format: 'mp3',
    },
    retries: {
        maxAttempts: 3,
    }
})
```

`voice` is required. `speed` defaults to 1 and must be a positive finite number. Provider voice names, formats, and speed ranges may be narrower than the core contract.

The response contains `audio` as a `Uint8Array`, optional `mediaType`, and `rawResponse`.

## 2. Validate the final script

```ts
import { z } from 'zod'

const SpeechInput = z.object({
  text: z.string().min(1).max(3_000),
  voice: z.enum(['alloy', 'verse', 'aria']),
})

const input = SpeechInput.parse(requestedSpeech)

const speech = await generateSpeech({
    text: input.text,
    model: audioModel,
    voice: input.voice,
    speed: 1,
    providerOptions: {
        response_format: 'mp3',
    }
})
```

The voice allow-list is application policy, not a universal provider list. Do not send unbounded agent output directly into synthesis.

## 3. Store and serve the result

```ts
const asset = await mediaStore.put({
  bytes: speech.audio.data,
  mediaType: speech.audio.mediaType ?? 'audio/mpeg',
  metadata: {
    voice: input.voice,
    model: audioModel.defaultModel ?? 'unknown',
  },
})
```

Keep raw audio out of sessions, traces, and event logs. Use a worker for long scripts and batch generation. Add consent, disclosure, and review controls when synthetic audio represents a real person.

Next, process existing audio with [transcription](/sdk/advanced/multimodal/transcription).
