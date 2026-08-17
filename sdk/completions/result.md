# Completion result

`generateCompletion()` returns convenient top-level fields for normal application code and the complete normalized response for integrations that need more detail.

## 1. Read visible text

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Summarize this support ticket in one sentence.',
    model
})

console.log(result.text)
```

`text` joins every text block in the assistant choice. It is the simplest field to render when the application expects a plain-language answer.

## 2. Inspect content blocks

Use `content` when the model may return more than text:

```ts
for (const item of result.content) {
  if (item.type === 'text') {
    console.log(item.text)
  }

  if (item.type === 'tool_call') {
    console.log(item.function.name, item.function.arguments)
  }

  if (item.type === 'reasoning') {
    console.log(item.text)
  }
}
```

Assistant content can contain text, tool calls, reasoning, or images. Check the discriminating `type` before reading fields that belong to a specific block.

A direct completion does not execute a returned local tool call. Treat it as a request for application code to handle, or use an [agent](/sdk/agents) when the runtime should execute tools and continue the model loop.

## 3. Record token usage

```ts
const {
  inputTokens,
  outputTokens,
  totalTokens,
  cachedInputTokens,
  cacheCreationInputTokens,
  details,
} = result.usage
```

The common counters are normalized across providers. `details` contains additional mutually exclusive provider buckets when the adapter can report them.

Usage is suitable for metrics, budgets, and cost estimation. Apply the selected provider's current pricing outside the core runtime rather than assuming one universal token price.

## 4. Use the normalized response

`result.response` contains the same assistant choice and usage plus lower-level response information:

```ts
const response = result.response

console.log(response.messageId)
console.log(response.contextUsage?.remainingTokens)
console.log(response.sources)
console.log(response.providerToolCalls)
```

The response fields are:

- `choice`: normalized assistant content;
- `usage`: normalized token accounting;
- `contextUsage`: known context-window occupancy, when model metadata is available;
- `messageId`: the provider message identifier, when supplied;
- `sources`: normalized citations from supported providers;
- `providerToolCalls`: metadata for tools executed by the provider; and
- `rawResponse`: the original provider response.

Prefer normalized fields in product code. Keep `rawResponse` at provider-integration or debugging boundaries because its shape changes by adapter and it may contain sensitive request or response data.

## 5. Read the final streaming response

Streaming emits incremental events and finishes with the same normalized response shape:

```ts
import { streamCompletion } from '@anvia/core'

for await (const event of streamCompletion({
    prompt: 'Draft a short incident update.',
    model
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    console.log(event.result.usage.totalTokens)
  }

  if (event.type === 'error') {
    console.error(event.error)
  }
}
```

Other stream events can carry reasoning deltas, tool-call deltas, complete tool calls, sources, provider tool calls, and message IDs. Consume only the event types the application needs and always handle `error` explicitly.

Continue with [When to use completions](/sdk/completions/when-to-use).
