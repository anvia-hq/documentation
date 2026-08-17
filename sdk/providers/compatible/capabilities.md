# Verify capabilities

An OpenAI-compatible endpoint is compatible only for the request paths it implements. Inspect the local adapter contract first, then run a live probe for every workflow the product requires.

## Inspect the adapter declaration

```ts
const model = compatible.completionModel({
    modelId: modelId
})

console.log(model.provider)
console.log(model.defaultModel)
console.log(model.capabilities)
```

A startup guard can reject an impossible local configuration:

```ts
if (config.acceptsDocuments && !model.capabilities.documentInput) {
  throw new Error('Selected adapter does not accept document files')
}

if (config.requiresSchema && !model.capabilities.outputSchema) {
  throw new Error('Selected adapter does not expose output schemas')
}
```

This checks the Anvia adapter. It does not prove that the server, selected model, account, or feature combination accepts the request.

## Probe each completion feature

Start with plain text, then add one live fixture per feature the product uses:

- A direct completion must return normalized assistant text.
- A stream must produce deltas and reach a final event.
- A tool run must produce complete, schema-valid arguments.
- Required or named tool choice must be honored when the workflow depends on it.
- Structured output must accept the schema and validate locally.
- Reasoning metadata must survive streaming and tool-result replay.
- Image input must accept the exact URL or byte format, media type, and size.
- Document input must accept the real file type on the selected Responses model.
- Usage must be present and normalized as expected by quotas or billing.

Some compatible Chat servers return reasoning through `reasoning` or `reasoning_content`. The adapter preserves known reasoning fields in assistant history. Test a complete multi-turn tool sequence because replay failures may not appear in the first response.

## Treat other model factories separately

`OpenAIClient` also creates embedding, image-generation, speech-generation, and transcription models, and it exposes `listModels()`:

```ts
const embeddings = compatible.embeddingModel({
    modelId: 'provider-embedding-id'
})
```

This client surface does not promise that a compatible endpoint implements every corresponding route. Completion support does not prove embeddings support; Responses support does not prove image, audio, or transcription support; and `/models` does not describe accepted request shapes.

Keep an application-owned registry of endpoint-and-model combinations that have passed their live capability tests. Do not derive it only from model names or compatibility claims.

## Test feature combinations

Many gaps appear only when features interact: forced tools during streaming, nested output schemas, reasoning plus tool replay, multiple tool calls, image input with tools, or usage on failed requests.

Exercise the exact combination the application ships with representative inputs.
