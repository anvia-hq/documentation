# Capabilities

`@anvia/openai` implements six Anvia model and provider capabilities.

| Capability | Implementation | Notes |
| --- | --- | --- |
| Completion | Responses and Chat Completions adapters | Both stream and support tools; select one with the required `api` model option. |
| Embeddings | `OpenAIEmbeddingModel` | Batches inputs and restores provider results to input order. |
| Images | `imageGenerationModel({ modelId })` | Requires base64 image output; URL-only responses are rejected. |
| Speech | `OpenAISpeechGenerationModel` | Returns bytes and a media type inferred from response format. |
| Transcription | `transcriptionModel({ modelId })` | Uploads request bytes with the supplied filename. |
| Model listing | `OpenAIClient.listModels()` | Normalizes provider model metadata. |

## Completion behavior

Both completion adapters normalize Anvia messages, documents, tools, structured output, reasoning, usage, and stream events. They expose model-aware context information for known IDs.

The adapters do not make every model support every request. Image input, reasoning controls, JSON schemas, and tool behavior remain model- and endpoint-dependent.

### Responses

`api: 'responses'` selects the Responses adapter. It uses provider-native Responses events and reports `provider: 'openai'`.

### Chat Completions

`api: 'chat'` selects the Chat Completions adapter. It reports `provider: 'openai-chat'`. The adapter preserves reasoning history used by compatible providers that return fields such as `reasoning_content`.

## Embedding guarantees

The embedding adapter defaults to batches of 1,024. It validates integer indices, rejects duplicates and out-of-range indices, validates numeric vectors, and returns one `Embedding` per input in original order.

Changing `dimensions` changes the stored vector shape. Rebuild an existing vector index before querying it with a different dimension.

## Media boundaries

- Image generation reads base64 output. It deliberately rejects URL-only OpenAI image responses.
- Speech returns the complete generated audio; it is not realtime voice or streaming audio.
- Transcription is a batch upload and returns normalized text; it is not a realtime transcription session.
- Video, image editing, realtime voice, batches, files, and fine-tuning are not Anvia model factories in this package. Use the underlying OpenAI client directly for native APIs outside the adapter surface.

## Failure behavior

Provider SDK errors propagate. Adapter validation also rejects malformed embedding indices, missing image data, and transcription responses without text. `listModels()` wraps listing failures in `ModelListingError` and preserves the provider and status code when available.
