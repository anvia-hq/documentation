# Multimodal pipelines

A useful media pipeline makes every representation change explicit.

```text
Asset ID
  -> authorize and load bytes
  -> transcribe or OCR
  -> normalize text
  -> extract or reason
  -> persist through a product service
```

Pass an asset ID through the pipeline and load bytes only in the stage that needs them.

## 1. Build a transcription pipeline

```ts
import { Pipeline } from '@anvia/core/pipeline'
import { extract } from '@anvia/core/extractor'
import { transcribe } from '@anvia/core/transcription'
import { z } from 'zod'

const CallAsset = z.object({
  assetId: z.string(),
  filename: z.string(),
})

const reviewCall = new Pipeline({
  id: 'review-call',
  inputSchema: CallAsset,
})
  .step({
    id: 'transcribe',
    run: async ({ input: { assetId, filename } }) => {
    const asset = await mediaStore.getAuthorized(assetId)

    const transcript = await transcribe({
        audio: {
            data: asset.bytes,
            filename
        },
        model: transcriptionModel,
        temperature: 0,
        retries: {
            maxAttempts: 3,
        }
    })

    return {
      assetId,
      transcript: transcript.text,
    }
    },
  })
  .step({
    id: 'review',
    run: async ({ input: { assetId, transcript } }) => {
      const review = await extract({
        model: reviewModel,
        text: transcript,
        outputSchema: callReviewSchema,
      })
      return { assetId, transcript, review: review.output }
    },
  })
```

`mediaStore`, `reviewModel`, and `callReviewSchema` are application dependencies. Authorization happens before bytes are returned, and extraction receives text rather than audio.

## 2. Choose each failure boundary

- Reject missing, expired, or unauthorized assets without calling a model.
- Retry transient transcription or OCR provider failures at that model call.
- Handle invalid extraction output through bounded extraction retry or human review.
- Protect product writes with idempotency and conflict handling.

Persist expensive intermediate transcription or OCR output when it is safe and useful. A later analysis retry can then reuse text without processing the media again.

## 3. Keep product writes separate

Shape and validate the final result before calling the product service. This keeps model retries from silently repeating a write.

Store raw media and generated assets outside the pipeline value whenever possible. Do not move base64 through graph metadata, observers, or job messages.

## 4. Add durability outside Pipeline

An Anvia pipeline runs in the current process. Use a durable worker when a media job must survive restarts, expose progress, or process a large backlog.

Queue stable IDs and approved options, not raw media. The worker resolves the authorized asset, runs the pipeline, stores outputs, and updates product-owned status.

Next, review the [production checklist](/sdk/advanced/multimodal/checklist).
