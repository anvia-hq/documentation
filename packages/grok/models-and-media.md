# Models and media

## Completion models

```ts
const responses = new GrokClient({ apiKey })
    .completionModel({
    modelId: 'grok-4.5',
    api: 'responses',
})

const chat = new GrokClient({ apiKey }).completionModel({
    modelId: 'grok-4.5',
    api: 'chat',
})
```

Choose Responses for provider tools and native source normalization. Choose Chat only for workflows that require that endpoint and do not use provider-executed tools.

## Image generation

```ts
const result = await grok.imageGenerationModel({ modelId: 'grok-imagine-image' }).imageGeneration({
  prompt: 'A robot reviewing a pull request in a glass office',
  width: 1024,
  height: 1024,
})
```

The adapter supports the documented ratio set, maps `13:6` to `19.5:9`, maps `6:13` to `9:19.5`, and sends `auto` for other ratios. Invalid, non-finite, or non-positive dimensions throw.

Provider base64 images are decoded directly. URL images are fetched and returned as bytes; a URL response without `fetch` is an error.

## Text-to-speech

```ts
const speech = await grok.speechGenerationModel().speechGeneration({
  text: 'The run is complete.',
  voice: 'eve',
  speed: 1,
  providerOptions: {
    language: 'en',
    output_format: { codec: 'mp3', sample_rate: 24_000 },
  },
})
```

Speed must be exactly `1`. Additional parameters must be an object.

## Transcription

```ts
const result = await grok.transcriptionModel().transcription({
  data: speech.audio.data,
  filename: 'speech.mp3',
  language: 'en',
})
```

The adapter uploads multipart bytes to the STT endpoint and retains provider JSON as `rawResponse`. A response without recognized text is rejected. Anvia `prompt` and `temperature` transcription options are rejected because this adapter does not map them to xAI.

## Model listing

`listModels()` normalizes inventory but does not classify each model into completion or media types. Keep capability-specific allowlists in application configuration.
