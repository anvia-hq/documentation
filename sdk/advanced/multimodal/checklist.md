# Production checklist

Use this checklist before shipping a workflow that accepts or produces media.

## Models and requests

- Smoke test the exact provider and model ID for every required capability.
- Validate image dimensions, audio duration, file size, media type, voice, and format before the provider request.
- Keep provider-specific `additionalParams` in typed configuration.
- Set timeouts, bounded retries, and cost limits for every model stage.
- Treat OCR, transcription, and image understanding as fallible model output.

## Storage and privacy

- Keep raw media in application-owned object or media storage.
- Pass asset IDs through queues, pipelines, sessions, and product records instead of byte arrays or base64.
- Use short-lived signed URLs when a provider must fetch a private asset.
- Enforce user and tenant authorization before loading or exposing media.
- Define retention and deletion for source assets, provider-side uploads, transcripts, OCR output, and generated assets.
- Keep sensitive media and transcripts out of traces, logs, and agent memory unless explicitly required and protected.

## Workflow behavior

- Separate media conversion from analysis and product writes.
- Persist expensive intermediate output when it is safe and useful for retries.
- Make product writes and generated-asset publication idempotent.
- Use a durable worker for long files, bulk work, progress reporting, or restart-safe execution.
- Apply content policy before publishing generated media.
- Provide human review for critical values, regulated decisions, or identity-sensitive media.

## Product experience

- Show upload, processing, failure, and completion states explicitly.
- Do not imply that OCR output proves authenticity or that a model description is certain.
- Make generated or synthetic media clear to users where the product requires disclosure.
- Check that the UI can safely render every media type returned by a model or tool.
- Provide a retry or fallback path that does not duplicate stored assets or product records.
