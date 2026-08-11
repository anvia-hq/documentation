# Mapping helpers

The package exports the same low-level mapping functions used by `MistralCompletionModel`:

```ts
import {
  fromMistralChatResponse,
  fromMistralChatStreamChunk,
  mistralMessageHelpers,
  toMistralChatParams,
} from '@anvia/mistral'
```

## Requests

```ts
const params = toMistralChatParams('mistral-large-latest', request)
```

The function converts Anvia messages, documents, tools, tool choice, schemas, and generation settings into a Mistral chat parameter object. `additionalParams` cannot override `model` or `messages`.

`mistralMessageHelpers.messageToMistralMessages(message)` exposes message conversion separately. A single Anvia message can become multiple Mistral messages depending on its parts.

`mistralMessageHelpers.toolDefinitionToMistral(tool)` converts one Anvia tool definition into the provider tool schema shape.

## Responses and streams

```ts
const complete = fromMistralChatResponse(providerResponse)
const events = fromMistralChatStreamChunk(providerChunk)
```

One provider stream chunk can produce several Anvia events, so the stream helper returns an array. Consumers must preserve event order.

## When to use these exports

Use the helpers for:

- a custom Mistral transport that should retain Anvia normalization;
- tests around provider payload compatibility;
- a gateway adapter that already returns Mistral chat shapes.

Prefer `MistralCompletionModel` for ordinary requests. The helpers are low-level and accept `unknown` provider responses; malformed payloads can throw or normalize to empty content depending on the missing field. Keep fixture coverage for every shape the custom transport emits.

The exact function signatures are in the [API reference](/packages/mistral/api-reference).
