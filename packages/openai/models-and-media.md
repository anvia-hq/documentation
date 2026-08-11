# Models and media

One OpenAI client creates independent model objects for different Anvia contracts.

## Select explicit defaults

```ts
import {
  GPT_IMAGE_1,
  TTS_1_HD,
  WHISPER_1,
  OpenAIClient,
} from '@anvia/openai'

const openai = new OpenAIClient({ apiKey })

const completion = openai.completionModel('gpt-5')
const embeddings = openai.embeddingModel('text-embedding-3-small')
const images = openai.imageGenerationModel(GPT_IMAGE_1)
const speech = openai.audioGenerationModel(TTS_1_HD)
const transcription = openai.transcriptionModel(WHISPER_1)
```

Known model-name types provide autocomplete while `ModelId` still permits a custom string. A name being accepted by TypeScript does not prove that the configured endpoint serves it.

## Generate images

```ts
const result = await images.imageGeneration({
  prompt: 'A clean isometric diagram of a distributed queue',
  width: 1024,
  height: 1024,
  additionalParams: {
    output_format: 'webp',
  },
})

console.log(result.mediaType, result.images.length)
```

The adapter requests `width x height` as the provider size and returns the first image plus the complete image array. DALL-E models are forced to base64 response format. URL-only responses are unsupported because the Anvia contract returns bytes.

## Generate speech

```ts
const result = await speech.audioGeneration({
  text: 'Your deployment has completed.',
  voice: 'alloy',
  speed: 1,
  additionalParams: { response_format: 'mp3' },
})
```

The operation buffers the complete SDK response into a `Uint8Array`. Supported response-format names map to MPEG, WAV, FLAC, Opus, AAC, or PCM media types.

## Transcribe audio

```ts
const result = await transcription.transcription({
  data: audioBytes,
  filename: 'meeting.wav',
  language: 'en',
  prompt: 'The speakers discuss Anvia and TypeScript.',
})

console.log(result.text)
```

The filename is required to construct the provider upload. A response must be a string or contain a `text` field.

## List models for inventory

```ts
const { data } = await openai.listModels()
```

Listing reports inventory; it does not classify every returned ID into Anvia capability factories. Maintain application allowlists for enabled models.
