# Multimodal pipelines

Multimodal pipelines connect deterministic media handling with specialized model stages. A useful pipeline makes every representation change visible: an asset becomes bytes, bytes become normalized text, text becomes structured data, and product code persists the result.

## Design around representation changes

```text
Upload reference
   ↓ permission and media validation
Audio or document bytes
   ↓ transcription or OCR
Normalized text
   ↓ extractor or agent
Structured result
   ↓ application service
Product record
```

Keep uploads and stored assets outside the pipeline value when possible. Pass an asset ID and load the bytes only in the stage that needs them.

## Build a transcription pipeline

```ts
import { PipelineBuilder } from '@anvia/core/pipeline'
import { transcriptionRequest } from '@anvia/core/transcription'
import { z } from 'zod'

const CallAsset = z.object({
  assetId: z.string(),
  filename: z.string(),
})

const reviewCall = new PipelineBuilder(CallAsset)
  .step(async ({ assetId, filename }) => {
    const asset = await mediaStore.getAuthorized(assetId)

    const transcript = await transcriptionRequest(transcriptionModel)
      .data(asset.bytes)
      .filename(filename)
      .temperature(0)
      .send()

    return { assetId, transcript: transcript.text }
  })
  .step(async ({ assetId, transcript }) => ({
    assetId,
    transcript,
    review: await callReviewExtractor.extract(transcript),
  }))
  .build()
```

`mediaStore` and `callReviewExtractor` are injected application dependencies. Authorization happens before bytes are returned, and the pipeline hands text—not audio—into the extraction stage.

## Choose the failure boundary

Each media stage can fail differently:

| Stage | Typical failure | Useful recovery |
| --- | --- | --- |
| Asset load | missing, expired, or unauthorized asset | reject without calling a model |
| Transcription or OCR | unsupported media, provider timeout | retry the model stage when safe |
| Extraction or agent | invalid structured output, model limit | retry or route for review |
| Product write | conflict or service failure | use an idempotent service method |

Persist a transcript or OCR result when it is expensive and safe to retain. A later extraction retry can then reuse that intermediate result instead of paying to process the media again.

## Use a worker for durable work

An Anvia pipeline runs in the current JavaScript process. It does not make a media job durable. Use BullMQ, Trigger.dev, or another job system when the workflow must survive restarts, expose progress, or process large backlogs.

The queue payload should contain stable IDs and options, not raw base64 media. The worker can resolve the authorized asset, run the pipeline, store outputs, and update application-owned job status.
