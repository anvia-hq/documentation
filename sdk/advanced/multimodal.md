# Multimodal

Multimodal workflows move between media, model-readable content, normalized text, and stored assets. Anvia keeps those capabilities separate so each stage can use the right model and the application can control every storage and permission boundary.

## Choose the capability

| Need | Use |
| --- | --- |
| Ask a completion model about an image or document | [Media input](/sdk/advanced/multimodal/inputs) |
| Create image bytes from a prompt | [Image generation](/sdk/advanced/multimodal/image) |
| Turn text into audio | [Audio generation](/sdk/advanced/multimodal/audio) |
| Turn audio into text | [Transcription](/sdk/advanced/multimodal/transcription) |
| Recover text and layout from a scanned file | [OCR](/sdk/advanced/multimodal/ocr) |
| Return an image from an agent tool | [Multimodal tool results](/sdk/advanced/multimodal/tool-results) |
| Connect several media stages | [Multimodal pipelines](/sdk/advanced/multimodal/pipelines) |
| Prepare a workflow for production | [Production checklist](/sdk/advanced/multimodal/checklist) |

## Separate understanding from generation

Image and document input are capabilities of a **completion model**. Image generation, audio generation, transcription, and OCR use their own model contracts.

```text
Image or document ──→ completion model ──→ text or tool calls
Text prompt ────────→ image model ───────→ image bytes
Text script ────────→ audio model ───────→ audio bytes
Audio bytes ────────→ transcription ─────→ text
Scanned file ───────→ OCR ───────────────→ pages and Markdown
```

A model that can inspect an image does not automatically generate images, and a provider package may implement only some of these contracts. Start with [Models](/sdk/models) to construct the required models, then use this section to compose them into an application workflow.

## Keep media at the application boundary

Anvia normalizes requests and responses, but the application still owns uploads, object storage, signed URLs, permissions, retention, moderation, and background jobs. Avoid carrying large byte arrays through agent memory, traces, or pipeline results. Store the asset and pass a small reference to later stages whenever they do not need the bytes directly.

Before launch, smoke test the exact provider, model ID, media type, dimensions, voice, and provider-specific parameters used by the workflow. Capability names alone do not prove that a particular request shape is supported.
