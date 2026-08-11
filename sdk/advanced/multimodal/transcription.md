# Transcription

Transcription turns audio bytes into normalized text through a `TranscriptionModel`. It is usually an ingestion step: validate an upload, transcribe it, then send only the resulting text into an extractor, agent, or retrieval workflow.

Create the model as described in [Transcription models](/sdk/models/transcription). Keep file access and provider credentials in a server route or worker.

## Transcribe an upload

```ts
import { transcriptionRequest } from '@anvia/core/transcription'

const transcript = await transcriptionRequest(transcriptionModel)
  .data(upload.bytes)
  .filename(upload.filename)
  .language('en')
  .prompt('Transcribe the customer support call exactly.')
  .temperature(0)
  .send()

console.log(transcript.text)
```

`.data(...)` accepts a `Uint8Array` or `ArrayBuffer`. Use a meaningful filename with an extension because a provider may use it to infer the media type. Building or sending a request with empty audio data throws.

The prompt should contain transcription guidance such as domain vocabulary, expected language, or formatting—not instructions for analyzing the conversation. Keep transcription and analysis as separate stages so their inputs, failures, and tests remain clear.

## Extract structured information afterward

```ts
const transcript = await transcriptionRequest(transcriptionModel)
  .data(upload.bytes)
  .filename(upload.filename)
  .temperature(0)
  .send()

const review = await callReviewExtractor.extract(transcript.text)

await callReviews.save({
  assetId: upload.assetId,
  transcript: transcript.text,
  review,
})
```

`callReviewExtractor` and `callReviews` are application-owned dependencies. This separation lets the application retry transcription without repeating the product write, or re-run extraction against an existing transcript.

## Protect the input and transcript

Validate ownership, file size, and media type before loading audio into memory. Store the original audio according to product retention policy, and keep raw bytes out of agent memory and observability payloads.

Transcripts can contain personal or regulated information even when the source audio appears harmless. Apply access controls and redaction before a transcript enters an agent, vector index, trace, or customer-visible summary. For large files, run the stages in a worker and persist intermediate status instead of holding an HTTP connection open.
