# Completion result

`generateCompletion()` returns a flat result: visible text, content blocks, usage, and the original provider payload. There is no nested `response` object.

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

  if (item.type === 'tool-call') {
    console.log(item.toolName, item.input)
  }

  if (item.type === 'reasoning') {
    console.log(item.text)
  }
  if (item.type === 'file') {
    console.log(item.mediaType, item.data)
  }
}
```

Assistant content can contain text, tool calls, reasoning, images, or files. Check the discriminating `type` before reading fields that belong to a specific block.

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

## 4. Use the rest of the result

The same object also exposes lower-level fields:

```ts
console.log(result.messageId)
console.log(result.contextUsage?.remainingTokens)
console.log(result.sources)
console.log(result.providerToolCalls)
console.log(result.finishReason)
```

The result fields are:

- `output`: parsed schema value when `outputSchema` is set, otherwise the same string as `text`;
- `text`: visible assistant text;
- `content`: normalized assistant content blocks;
- `usage`: normalized token accounting;
- `finishReason` and `providerFinishReason`: why the provider stopped, when known;
- `contextUsage`: known context-window occupancy, when model metadata is available;
- `messageId`: the provider message identifier, when supplied;
- `sources`: normalized citations from supported providers;
- `providerToolCalls`: metadata for tools executed by the provider; and
- `rawResponse`: the original provider response.

Prefer normalized fields in product code. Keep `rawResponse` at provider-integration or debugging boundaries because its shape changes by adapter and it may contain sensitive request or response data.

## 5. Read the final streaming response

Streaming emits incremental events and finishes with a `final` event whose `result` is the same `CompletionResult` shape:

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

Passing `outputSchema` to `streamCompletion()` yields a typed result as well: the `final` event carries `result.output` parsed and validated against the schema before the event is emitted:

```ts
import { z } from 'zod'

for await (const event of streamCompletion({
    prompt: 'Extract the incident title.',
    model,
    outputSchema: z.object({ title: z.string() })
})) {
  if (event.type === 'final') {
    console.log(event.result.output.title)
  }
}
```

Parsing or validation failures produce a `CompletionStructuredOutputError` with a `phase` of `'truncated'`, `'content-filter'`, `'parse'`, or `'schema'`. In a stream the error arrives as the `error` event; `generateCompletion()` rejects with the same error. See [Structured output](/sdk/structured-output) for schema design and failure handling.

Continue with [When to use completions](/sdk/completions/when-to-use).
