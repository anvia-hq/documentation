# Completion result

`createCompletion(...)` returns convenient display fields alongside the complete normalized provider response.

## Read the result

```ts
const result = await createCompletion(model, {
  input: 'Summarize this support ticket.',
})

console.log(result.text)
console.log(result.usage.totalTokens)
```

| Field | Contains |
| --- | --- |
| `text` | Visible text extracted from the assistant content. |
| `content` | Normalized assistant content blocks. |
| `usage` | Normalized token accounting. |
| `response` | The complete normalized completion response. |

## Token usage

```ts
const {
  inputTokens,
  outputTokens,
  totalTokens,
  cachedInputTokens,
  cacheCreationInputTokens,
} = result.usage
```

Top-level input and output counts are inclusive totals. Provider-specific pricing buckets may also be available under `usage.details`.

## Normalized response

`result.response` exposes lower-level information when the application needs more than display text.

| Field | Contains |
| --- | --- |
| `choice` | The normalized assistant content returned by the model. |
| `usage` | Provider-reported token usage. |
| `contextUsage` | Known context-window occupancy for the completed request. |
| `messageId` | Provider message identifier, when available. |
| `sources` | Normalized URL citations returned by supported providers. |
| `providerToolCalls` | Provider-executed tool metadata, when available. |
| `rawResponse` | The original provider response. |

Use normalized fields in product code. Keep `rawResponse` at integration or debugging boundaries because its shape changes by provider and may contain data that should not be logged.
