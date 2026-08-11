# Capabilities

`@anvia/anthropic` is a focused completion provider.

| Capability | Support |
| --- | --- |
| Text completion | Yes |
| Streaming | Yes |
| Tools and tool results | Yes |
| Structured output through tools/schemas | Yes |
| Image message content | Yes, for models that accept it |
| Reasoning content and usage | Normalized when returned |
| Model listing | Anthropic API client only |
| Vertex AI | Dedicated `AnthropicVertexClient` |
| Embeddings | Not implemented |
| Image/audio generation or transcription | Not implemented |

## Completion behavior

`AnthropicCompletionModel` maps Anvia history, documents, tools, tool choice, multimodal message parts, usage, and streaming events to Anthropic Messages. It accepts either the standard `Anthropic` client or `AnthropicVertex` client.

Known Claude IDs expose model-aware context information. Custom model strings remain accepted for compatible services, but no context metadata is inferred for unknown IDs.

## Tools and structured output

Tools become Anthropic tool definitions and tool results return as provider content blocks. Schema validation protects the application from malformed arguments; it does not authorize the request or make the tool idempotent.

Provider and model restrictions still apply. Test forced tool choice, parallel calls, image content, and reasoning controls with the exact deployment target.

## Unsupported surfaces

The package does not adapt Anthropic administration, batches, files, prompt caching administration, or other native non-completion endpoints into Anvia contracts. It also does not provide embedding or media model factories. Use the underlying official client directly when those provider-native APIs are required.

## Failure behavior

SDK and provider errors propagate from completion calls and streams. The adapter rejects malformed response shapes rather than manufacturing missing content. Model-listing errors from `AnthropicClient` are wrapped in `ModelListingError`; Vertex does not offer model listing through this client.
