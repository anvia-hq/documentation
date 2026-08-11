# Chat or Responses

`OpenAIClient` has two completion adapters. They normalize either Chat Completions or Responses into the same Anvia completion contract, but the upstream HTTP endpoints are not interchangeable.

## Default with a custom endpoint

A custom `baseUrl` makes Chat the default because it is the more common compatibility surface:

```ts
const client = new OpenAIClient({
  apiKey,
  baseUrl,
})

const model = client.completionModel(modelId)
```

Set the choice explicitly in production configuration so a future refactor cannot change the selected surface accidentally:

```ts
const chatClient = new OpenAIClient({
  apiKey,
  baseUrl,
  completionApi: 'chat',
})
```

## Choose Responses deliberately

Use Responses only when the endpoint documents and implements an OpenAI-compatible `/responses` API:

```ts
const responsesClient = new OpenAIClient({
  apiKey,
  baseUrl,
  completionApi: 'responses',
})

const model = responsesClient.completionModel(modelId)
```

An endpoint supporting `/chat/completions` does not imply that `/responses` exists. A similarly named proprietary response API is not necessarily compatible either.

## What the adapters declare

At the Anvia adapter level, both paths support streaming, tools, tool choice, image input, output schemas, and reasoning content. The Responses adapter also declares document input.

Those declarations describe what the adapter can represent—not what a compatible server, account, or model supports. Use them to reject impossible application configuration, then use live tests to prove the endpoint.

| Workflow need | Initial choice | Still verify |
| --- | --- | --- |
| Ordinary compatible completion | Chat | Message mapping and final output |
| Streaming UI | Either implemented surface | Text deltas, finish event, errors, usage |
| Local tools | Either implemented surface | Tool choice and complete streamed arguments |
| Structured output | Either implemented surface | Accepted schema shape and valid output |
| Document-file input | Responses | File types, size limits, and model access |
| Reasoning metadata | Either implemented surface | Provider field shape and replay across tool turns |

## Do not silently fall back

Avoid retrying a failed Responses request through Chat or changing model IDs inside a generic error handler. The second request can have different content support, tool behavior, and output semantics.

If the product supports both surfaces, configure two tested model boundaries and choose between them before the run. Record the chosen endpoint, adapter, and model in traces so failures can be reproduced.

