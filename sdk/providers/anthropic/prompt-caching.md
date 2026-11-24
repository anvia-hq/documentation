# Prompt caching

Anthropic can cache a request prefix across turns: the provider stores the processed tools, system prompt, and
conversation prefix, and a later request that repeats it reads the cached tokens instead of processing them
again. `@anvia/anthropic` can place the cache breakpoints for you.

## 1. Opt in per model

```ts anvia-check anthropic-prompt-cache-example
import { AnthropicClient } from '@anvia/anthropic'

declare const apiKey: string

const anthropic = new AnthropicClient({ apiKey })

const model = anthropic.completionModel({
  modelId: 'claude-sonnet-5',
  promptCache: true,
})
```

`promptCache` is disabled by default. `true` uses the 5-minute cache; `{ ttl: '1h' }` opts into Anthropic's
extended cache. The setting applies to every request from that model, on both the direct and Vertex clients.
Set it on the model rather than per call so retries and agent turns use the same breakpoints.

## 2. Know where breakpoints go

On each request the adapter adds `cache_control` at the end of the widening prefixes:

- the last tool definition;
- the system prompt;
- the last cacheable content block of the conversation.

A later turn can then read the whole previous input prefix from cache and write only the new tokens. Content
block types that accept a marker are `text`, `image`, `document`, `tool_use`, and `tool_result`; thinking blocks
do not. Anthropic accepts at most four breakpoints per request, and markers already present in the request count
towards that limit. A section whose last block already carries a marker is left alone, so applying the transform
twice is a no-op.

## 3. Read the usage

Cache activity appears in `Usage` as `cachedInputTokens` (read from cache) and `cacheCreationInputTokens`
(written to cache). They are additive accounting, not additional prompt text. An agent's aggregate usage sums
them across turns.

## 4. Expect misses

Anthropic ignores a breakpoint whose prefix is below the model's minimum cacheable length — 1,024 tokens on
Claude Sonnet and Opus, 4,096 on Claude Haiku 4.5. A short system prompt or a changing first turn produces no
cache read, and caching never changes model output. Do not promise users a cost reduction without measuring
`cachedInputTokens` for your real prompt shapes.

## 5. Use the helpers directly

`withAnthropicPromptCache(params, options)` applies the same transform to a raw Messages request, and
`anthropicPromptCacheOptions(setting)` normalizes a setting. The exported types are
`AnthropicPromptCacheSettings`, `AnthropicPromptCacheOptions`, and `AnthropicPromptCacheTtl`; import them from
`@anvia/anthropic`.
