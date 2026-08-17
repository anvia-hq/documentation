# Provider capabilities

This page describes the contracts declared by the current Anvia adapters. A declared capability does not guarantee that every upstream model ID, account, region, or compatible endpoint enables it.

## 1. OpenAI

The default Responses adapter declares streaming, tools, tool choice, image input, file-document input, output schemas, reasoning content, and provider-executed tools.

The Chat Completions adapter declares streaming, tools, tool choice, image input, output schemas, and reasoning. It does not declare file-document input or provider-executed tools.

The package also exposes embeddings, image generation, audio generation, transcription, and model listing.

## 2. Anthropic

The completion adapter declares streaming, tools, tool choice, image input, file-document input, and reasoning. It does not declare Core output schemas or provider-executed tools.

The direct Anthropic client supports model listing. The Vertex client does not expose Anthropic's model-listing API. The package has no embedding, image-generation, speech-generation, transcription, or OCR model factory.

## 3. Gemini

The completion adapter declares streaming, tools, tool choice, image input, file-document input, output schemas, and reasoning. It does not declare provider-executed tools.

The package also exposes embeddings, image generation, transcription, and model listing. It has no speech-generation or OCR model factory.

## 4. Mistral

The completion adapter declares streaming, tools, tool choice, and output schemas. It does not declare image input, file-document input, reasoning, or provider-executed tools.

The package also exposes embeddings, OCR, and model listing. It has no image-generation, speech-generation, or transcription model factory.

## 5. Grok

The Responses adapter mirrors the OpenAI Responses surface and enables xAI provider-executed tools such as live search. The Chat adapter mirrors the OpenAI Chat surface and omits file documents and provider tools.

The package also exposes image generation, audio generation, transcription, and model listing. It has no embedding or OCR model factory.

## 6. Read the declaration in code

```ts
const model = client.completionModel({
    modelId: config.model,
    api: config.api,
})

console.log(model.provider)
console.log(model.defaultModel)
console.log(model.capabilities)
```

Reject incompatible application configuration at startup:

```ts
if (
  config.attachments &&
  !model.capabilities.documentInput
) {
  throw new Error(
    'Configured model does not accept document files.',
  )
}

if (
  config.structuredOutput &&
  !model.capabilities.outputSchema
) {
  throw new Error(
    'Configured model does not expose output schemas.',
  )
}
```

## 7. Treat compatible endpoints separately

[Compatible APIs](/sdk/providers/compatible) reuse an OpenAI or Anthropic HTTP shape. Streaming chunks, tool arguments, schemas, reasoning fields, and media commonly differ.

For a custom `baseUrl`, select `api: 'chat'` or `api: 'responses'` explicitly according to the endpoint surface.

## 8. Run minimum live verification

Test one direct completion, one complete stream, the tool-choice modes you use, parsed output when required, every representative media or embedding path, and one error case for retry behavior.

Record provider, model ID, endpoint, region, and relevant parameters with the result. Repeat when any of them changes.

Next, open the guide for the selected provider from [Providers](/sdk/providers).
