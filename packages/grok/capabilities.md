# Capabilities

`@anvia/grok` combines OpenAI-compatible completion adapters with xAI-specific tools and media endpoints.

| Capability | Support |
| --- | --- |
| Responses completion and streaming | Yes, default |
| Chat Completions and streaming | Yes |
| Local Anvia tools | Yes |
| xAI provider tools | Responses only |
| Image generation | Yes |
| Batch text-to-speech | Yes |
| Batch transcription | Yes |
| Model listing | Yes |
| Embeddings | Not implemented |
| Video, realtime voice, streaming speech | Not implemented |

## Completion adapters

`GrokResponsesCompletionModel` delegates normalized Responses behavior to the OpenAI adapter and adds Grok provider-tool and source normalization. `GrokChatCompletionModel` delegates Chat Completions behavior but does not accept provider-executed tools.

Known Grok IDs expose context limits. Provider-specific request fields can pass through completion `additionalParams`.

## Provider tools

Web search, X search, code interpreter, file search, and remote MCP return Anvia `ProviderTool` values. They are sent to xAI and never executed by the local `ToolSet`. Local tools and provider tools can coexist in one agent.

## Images

The image adapter requests base64 by default and also accepts provider URL output when `fetch` is available. Width and height map to supported xAI ratios; unknown ratios become `auto`, and explicit provider `aspect_ratio` wins.

## Speech

Text-to-speech calls `/tts` and accepts binary or JSON/base64 output. The current adapter rejects any speed other than `1` because xAI does not expose speed control through this path.

Transcription calls `/stt` with multipart audio and returns normalized text. Both operations require `fetch` and a usable API key.

## Unsupported surfaces

The package does not expose image editing, video generation, realtime voice, streaming speech, file/collection management, batches, stored completions, compaction, or native telemetry APIs. Call a provider API directly when no Anvia contract exists.
