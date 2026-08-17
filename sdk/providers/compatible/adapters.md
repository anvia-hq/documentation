# Chat or Responses

`OpenAIClient` can normalize Chat Completions or Responses into the same Anvia completion contract. Choose the API your compatible endpoint actually implements when creating the model.

## Select Chat explicitly

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey, baseUrl })
const model = client.completionModel({
  modelId,
  api: 'chat',
})
```

The Chat adapter declares streaming, local tools, tool choice, image input, output schemas, and reasoning content. It does not declare document input or provider-executed tools.

## Select Responses deliberately

Use Responses only when the server documents and implements an OpenAI-compatible `/responses` API:

```ts
const model = client.completionModel({
  modelId,
  api: 'responses',
})
```

The Responses adapter additionally declares document input and provider-executed tools. A server that implements `/chat/completions` does not automatically implement `/responses`.

## Match the API to the workflow

Use Chat as the initial choice for ordinary compatible completions. Use Responses when the workflow needs document files or provider tools and the endpoint supports them. Either adapter can represent streaming, local tools, structured output, images, and reasoning, but the remote server and selected model must still prove those features.

Test complete behavior: streamed deltas and termination, tool argument assembly and replay, schema acceptance and local validation, representative media, reasoning replay, normalized usage, and failure shapes.

Avoid retrying a failed Responses request through Chat or swapping model IDs in a generic error handler. If the product supports both APIs, create separately tested model handles and choose one before the run. Record the endpoint, API, and model so failures can be reproduced.
