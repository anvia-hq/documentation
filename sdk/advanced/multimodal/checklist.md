# Multimodal production checklist

Use this checklist before shipping a workflow that accepts or produces media.

## Models and requests

- Smoke test the exact provider, adapter, and model ID for every capability.
- Validate dimensions, duration, file size, detected media type, voice, and format.
- Keep provider-specific `providerOptions` in typed allow-listed configuration.
- Set bounded retries and application-level time or cost limits for each stage.
- Treat OCR, transcription, and image understanding as fallible output.
- Verify structured image tool results survive the exact provider path.

## Storage and privacy

- Keep raw media in application-owned object or media storage.
- Pass asset IDs through queues, pipelines, sessions, and product records.
- Use short-lived signed URLs when a provider must fetch a private asset.
- Authorize user and tenant access before loading or exposing media.
- Define retention and deletion for sources, provider uploads, transcripts, OCR output, and generated assets.
- Keep sensitive media and extracted text out of traces, logs, and memory unless explicitly protected.

## Workflow behavior

- Separate media conversion from analysis and product writes.
- Persist expensive intermediate output when safe and useful for retries.
- Make product writes and asset publication idempotent.
- Use a durable worker for long files, bulk work, progress, or restart safety.
- Apply product content policy before publishing generated media.
- Require human review for critical values, regulated decisions, or identity-sensitive output.

## Product experience

- Show upload, processing, failure, and completion states explicitly.
- Do not imply that OCR proves authenticity or that a model description is certain.
- Disclose generated or synthetic media when product policy requires it.
- Render only allow-listed media types in the UI.
- Provide retry and fallback paths that cannot duplicate assets or product records.

## Final verification

- Test invalid, empty, oversized, and unauthorized media.
- Test provider timeouts and retry exhaustion.
- Test the exact output media type before storage and display.
- Test source and generated-asset deletion.
- Confirm stream, trace, and memory payloads do not contain unintended bytes or base64.
