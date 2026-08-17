# Transcription

`transcribe()` turns audio bytes into normalized text through a `TranscriptionModel`.

## 1. Transcribe an upload

```ts
import { transcribe } from '@anvia/core/transcription'

const transcript = await transcribe({
    audio: {
        data: upload.bytes,
        filename: upload.filename
    },
    model: transcriptionModel,
    language: 'en',
    prompt: 'Transcribe the customer support call exactly.',
    temperature: 0,
    retries: {
        maxAttempts: 3,
    }
})

console.log(transcript.text)
```

The first argument accepts `Uint8Array` or `ArrayBuffer`. Anvia copies the supplied bytes before the provider call and rejects empty audio or an empty filename.

Use a meaningful filename with an extension because the provider may use it to infer the format. Language, prompt, temperature, and `providerOptions` pass through to the configured model adapter.

## 2. Keep transcription and analysis separate

The transcription prompt should contain vocabulary, language, or formatting guidance. Analyze the conversation in a later extractor or agent stage:

```ts
const transcript = await transcribe({
    audio: {
        data: upload.bytes,
        filename: upload.filename
    },
    model: transcriptionModel,
    temperature: 0
})

const review = await extract({
  model: reviewModel,
  text: transcript.text,
  outputSchema: callReviewSchema,
})

await callReviews.save({
  assetId: upload.assetId,
  transcript: transcript.text,
  review: review.output,
})
```

This boundary lets the application reuse an existing transcript without paying to process the audio again.

## 3. Protect source and output

Validate ownership, file size, and detected media type before loading audio. Keep raw bytes out of agent memory and observability payloads.

Transcripts may contain personal or regulated information. Apply authorization and redaction before indexing, tracing, or displaying them.

Use a durable worker for long files, progress reporting, or restart-safe processing.

Next, recover text from scans with [OCR](/sdk/advanced/multimodal/ocr).
