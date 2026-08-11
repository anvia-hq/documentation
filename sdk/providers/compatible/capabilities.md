# Verify capabilities

An OpenAI-compatible endpoint is compatible only for the request paths it actually implements. Check the Anvia adapter declaration first, then run a live probe for every required workflow.

## Inspect the completion contract

```ts
const model = compatible.completionModel(modelId)

console.log(model.provider)
console.log(model.defaultModel)
console.log(model.capabilities)
```

A configuration guard can catch a mismatch before serving traffic:

```ts
if (config.acceptsDocuments && !model.capabilities.documentInput) {
  throw new Error('Selected completion adapter does not accept document files')
}

if (config.requiresSchema && !model.capabilities.outputSchema) {
  throw new Error('Selected completion adapter does not expose output schemas')
}
```

This is a local contract check. It does not prove that the remote endpoint, chosen model, account, or feature combination will accept the request.

## Prove completion behavior

Start with text, then add tests only for features the product uses:

| Capability | What the test must prove |
| --- | --- |
| Direct completion | Normalized assistant text is returned. |
| Streaming | Text deltas arrive and the stream reaches a final event. |
| Tools | The selected model emits a tool call with complete, schema-valid arguments. |
| Tool choice | Required or forced selection is honored when the workflow depends on it. |
| Structured output | The endpoint accepts the schema and the result validates locally. |
| Reasoning | Expected metadata survives streaming and multi-turn tool history. |
| Image input | The exact URL or base64 format, media type, and size are accepted. |
| Document input | The selected Responses endpoint and model accept the actual file type. |
| Usage | Token counts are present and mapped as the application expects. |

Some compatible Chat servers return reasoning through `reasoning` or `reasoning_content`. Anvia preserves known fields in assistant history, which matters when the next request includes a tool result. Test the complete multi-turn tool sequence; inspecting only the first response can miss replay failures.

## Treat other model factories separately

`OpenAIClient` also exposes factories for embeddings, image generation, audio generation, and transcription, plus `listModels()`. That public surface does not promise that a compatible endpoint implements the corresponding routes.

```ts
const embeddings = compatible.embeddingModel('provider-embedding-id')
```

Create such a model only after the endpoint documents that API and a live request passes. In particular:

- completion support does not prove `/embeddings` support;
- Responses support does not prove image, audio, or transcription support;
- a model returned by `/models` does not identify which request shapes it accepts;
- a successful non-streaming call does not prove compatible streaming events.

Keep an application-owned capability registry for tested endpoint-and-model combinations. Do not build it solely from model names or a provider's marketing label.

## Know the common gaps

Compatibility failures often appear in combinations rather than basic text output: forced tool calls during streaming, schemas with nested unions, reasoning plus tool replay, multiple tool calls, image inputs with tools, or usage on failed requests.

Use representative fixtures and exercise the combination your application ships.

