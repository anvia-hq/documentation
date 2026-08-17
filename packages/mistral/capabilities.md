# Capabilities

`@anvia/mistral` provides completion, embedding, OCR, and model-listing adapters.

| Capability | Support |
| --- | --- |
| Text completion and streaming | Yes |
| Tools and tool choice | Yes |
| Structured output | Yes |
| Dense embeddings | Yes |
| OCR | URLs, file IDs, images, and byte uploads |
| Model listing | Yes |
| Chat image/document input | Not implemented |
| Transcription or audio generation | Not implemented |
| Image generation | Not implemented |

## Completion

The completion handle maps Anvia messages and tools to Mistral chat parameters and normalizes complete responses and stream chunks. Known IDs provide model-aware context metadata.

Tool arguments are parsed as JSON. Malformed arguments throw instead of becoming an unvalidated string. Missing provider tool-call IDs are derived deterministically, and tool-result names are preserved.

## Embeddings

`embeddingModel({ modelId, ... })` requires an explicit model ID, batches 1,024 inputs by default, and validates that the response count and vector values match the request. When supplied, `dimensions` is forwarded to Mistral and also describes the expected vector shape to Anvia.

## OCR

OCR accepts document URLs, image URLs, existing file IDs, and bytes. Byte input is uploaded with purpose `ocr`, then processed by file ID. The normalized response combines page markdown into `markdown` and `text` while retaining per-page detail and raw provider output.

## Unsupported surfaces

The package does not currently map chat image parts or document file parts, even when a named Mistral model can support vision natively. It also does not expose transcription, audio, image generation, agents, files, or administration APIs as Anvia model factories. Use the official client directly for provider-native surfaces.

## Errors

Provider SDK failures propagate. The adapter additionally rejects invalid embedding shapes, malformed tool JSON, empty OCR bytes or filenames, upload responses without a file ID, and unusable OCR response fields. Model-listing failures become `ModelListingError`.
