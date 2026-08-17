# Multimodal workflows

Multimodal workflows move between media, model-readable content, normalized text, and stored assets. Anvia keeps these capabilities separate so each stage can use the correct model contract.

```text
Image or document -> completion model -> text or tool calls
Text prompt       -> image model      -> image bytes
Text script       -> audio model      -> audio bytes
Audio bytes       -> transcription    -> text
Scanned file      -> OCR              -> pages and Markdown
```

A completion model that inspects an image does not automatically generate images. A provider package may implement only some of these contracts.

## 1. Choose the capability

- Use [media input](/sdk/advanced/multimodal/inputs) to ask a completion model about an image or document.
- Use [image generation](/sdk/advanced/multimodal/image) to create image bytes from text.
- Use [audio generation](/sdk/advanced/multimodal/audio) to synthesize speech.
- Use [transcription](/sdk/advanced/multimodal/transcription) to turn audio into text.
- Use [OCR](/sdk/advanced/multimodal/ocr) for scanned document text and layout.
- Use [structured tool results](/sdk/advanced/multimodal/tool-results) when the next model turn needs an image returned by a tool.
- Use [multimodal pipelines](/sdk/advanced/multimodal/pipelines) to make representation changes explicit.

## 2. Keep media at the application boundary

Anvia normalizes model requests and responses. The application still owns uploads, object storage, signed URLs, authorization, retention, moderation, and background jobs.

Avoid carrying large byte arrays or base64 strings through agent memory, traces, queues, and product database rows. Store the asset and pass a stable ID until a model stage genuinely needs the bytes.

## 3. Validate the exact provider path

Capability flags catch unsupported completion inputs, but they cannot prove that every model ID supports a particular media type, dimension, voice, format, or provider parameter.

Smoke test the exact provider, model ID, content type, and options used in production. Treat all media understanding and extraction as fallible model output.

## 4. Review production boundaries

Before launch, use the [multimodal production checklist](/sdk/advanced/multimodal/checklist).
