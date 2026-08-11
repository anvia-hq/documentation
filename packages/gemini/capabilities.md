# Capabilities

`@anvia/gemini` supports both Gemini Developer API and Vertex AI through `@google/genai`.

| Capability | Factory | Notes |
| --- | --- | --- |
| Completion | `completionModel()` | Streaming, tools, structured output, and multimodal messages. |
| Embeddings | `embeddingModel()` | Task type, title, dimensions, and batching. |
| Native Gemini images | `imageGenerationModel()` | Uses `generateContent` and inline image parts. |
| Imagen images | `imagenGenerationModel()` | Uses `generateImages`. |
| Transcription | `transcriptionModel()` | Sends inline audio through `generateContent`. |
| Model listing | `listModels()` | Normalizes Gemini model inventory. |

## Completion

The completion adapter maps Anvia messages, documents, tools, tool results, structured output, usage, reasoning, and streaming events to Google GenAI content. Known model IDs expose context metadata.

Capability remains model-dependent. A completion model name can identify an image-capable or TTS-preview model without automatically making it suitable for every completion request.

## Embeddings

The adapter defaults to batches of 100 and validates that the provider returns one numeric vector for each input. Supported task types include retrieval query/document, semantic similarity, classification, clustering, question answering, fact verification, and code retrieval query.

`title` and task type are forwarded to the provider. Their validity depends on the selected embedding model and task.

## Images and transcription

Gemini-native image generation and Imagen are separate classes because their API methods and result shapes differ. Both return decoded bytes and reject responses without valid image content.

Transcription is prompt-based audio understanding using a Gemini completion model. It maps common filename extensions to audio MIME types and rejects a response without text. It is not a realtime transcription API.

## Unsupported surfaces

There is no Anvia audio-generation model in this package. Live sessions, files, caches, batches, tuning, and other native Google GenAI modules are not exposed as Anvia factories. Use the injected `GoogleGenAI` client directly when native APIs are needed.
