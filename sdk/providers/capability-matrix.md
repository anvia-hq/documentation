# Capability matrix

This matrix describes what the current Anvia provider adapters can represent. A **Yes** means the adapter implements the Core capability; it does not mean every upstream model ID, account, region, or endpoint supports it.

Always test the exact production model and configuration, including provider-specific `additionalParams`.

## Completion capabilities

| Capability | OpenAI | Anthropic | Gemini | Mistral | Grok |
| --- | --- | --- | --- | --- | --- |
| Text completion | Yes | Yes | Yes | Yes | Yes |
| Streaming | Yes | Yes | Yes | Yes | Yes |
| Tools | Yes | Yes | Yes | Yes | Yes |
| Tool choice | Yes | Yes | Yes | Yes | Yes |
| Structured output schema | Yes | No | Yes | Yes | Yes |
| Image input | Yes | Yes | Yes | No | Yes |
| Document-file input | Responses only | Yes | Yes | No | Responses only |
| Reasoning content | Yes | Yes | Yes | No | Yes |
| Provider-executed tools | Responses only | No | No | No | Responses only |
| Normalized citations and provider-tool events | Responses only | No | No | No | Responses only |

OpenAI and Grok expose Responses and Chat completion adapters. Responses is the default for their normal first-party clients. Their Chat adapters do not declare document-file input or provider-executed tools.

Document-file input means a provider-native file or URL attachment. Text extracted from a document can still be included as normal text with any completion provider.

## Other model capabilities

| Capability | OpenAI | Anthropic | Gemini | Mistral | Grok |
| --- | --- | --- | --- | --- | --- |
| Embeddings | Yes | No | Yes | Yes | No |
| Image generation | Yes | No | Yes | No | Yes |
| Audio generation | Yes | No | No | No | Yes |
| Transcription | Yes | No | Yes | No | Yes |
| OCR | No | No | No | Yes | No |
| Model listing | Yes | Yes\* | Yes | Yes | Yes |

\* Direct `AnthropicClient` can list models. `AnthropicVertexClient` cannot because Vertex AI does not expose Anthropic's Models API.

These capabilities use separate Core interfaces and provider factories. Support for completion does not imply support for embeddings, transcription, or media generation.

## Read a completion model declaration

Anvia completion models expose adapter capabilities on the model object:

```ts
const model = client.completionModel(config.model)

console.log(model.provider)
console.log(model.defaultModel)
console.log(model.capabilities)
```

A typical guard can reject an invalid application configuration at startup:

```ts
if (config.attachments && !model.capabilities.documentInput) {
  throw new Error('Configured completion model does not accept document files')
}

if (config.structuredOutput && !model.capabilities.outputSchema) {
  throw new Error('Configured completion model does not expose output schemas')
}
```

This is contract validation, not a network capability probe. The provider may still reject an unsupported model, account, region, parameter, file type, or feature combination.

## Compatible endpoints

[Compatible APIs](/sdk/providers/compatible) share an OpenAI or Anthropic HTTP shape, but that does not guarantee feature parity. Streaming chunks, tool arguments, tool choice, structured output, reasoning fields, and media inputs commonly differ.

When `OpenAIClient` receives a custom `baseUrl`, it defaults to the Chat adapter. Set `completionApi` explicitly only when the endpoint actually implements the selected surface.

## Minimum verification

After using this table to make a shortlist, run the smallest request that proves every required path:

- a direct completion for credentials and request mapping
- a streamed completion consumed through the final event
- a forced or required tool call when the workflow depends on tool choice
- a parsed completion for structured output
- representative image, document, audio, embedding, transcription, or OCR input
- an error case to confirm retry and fallback behavior

Record the provider, exact model ID, endpoint, region, and relevant parameters with the test result. Repeat these tests when any of them changes.

