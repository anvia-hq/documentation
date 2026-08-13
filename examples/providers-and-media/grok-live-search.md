# Grok live search

**Type:** Pattern

## Outcome

Let Grok execute provider-native web and X searches and return normalized sources alongside the
answer. Use this for current-information research where citation provenance is part of the product.

## Prerequisites

- `pnpm add @anvia/core @anvia/grok`
- A server-side `XAI_API_KEY` with the required xAI features
- An allow-list of acceptable domains or X handles

## Implementation

```ts
import { Agent } from '@anvia/core/agent'
import { GrokClient, tools as grokTools } from '@anvia/grok'

const apiKey = process.env.XAI_API_KEY
if (!apiKey) throw new Error('Set XAI_API_KEY.')

const grok = new GrokClient({ apiKey })
const researcher = new Agent({
  id: 'researcher',
  model: grok.completionModel(),
  instructions: 'Research current information and cite every factual update.',
  additionalParams: { max_turns: 5 },
  tools: [grokTools.webSearch({ allowedDomains: ['x.ai'] }), grokTools.xSearch({ allowedHandles: ['xai'] })],
})

const response = await researcher.prompt('What are the latest xAI product updates?').send()

console.log(response.output)
console.log(response.sources)
console.log(response.providerToolCalls)
```

## Run and expected behavior

Run `pnpm tsx grok-search.ts`. Grok may invoke one or both provider tools. Anvia exposes the answer,
normalized URL sources where supplied, and provider tool-call metadata. Search results change over
time, so exact output is intentionally not fixed.

## Boundaries

Search results and social posts can be wrong, malicious, outdated, or prompt-injecting. Allowed
domains narrow retrieval but do not establish truth. Render links safely, preserve source identity,
avoid automatically executing instructions found in retrieved text, and never pass secrets into a
search query.

In production, cap provider turns, apply domain and handle policies, cache with freshness metadata,
show citations next to supported claims, log normalized provenance, and evaluate source quality and
answer faithfulness on time-stamped queries.

## Source and extensions

Run the
[Grok live-search cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/04_providers_and_multimodal/13-grok-live-search.ts).
Next, add a source-quality gate, freshness display, or compare live results with a curated knowledge
index.

- [Grok package](/packages/grok)
- [Grok server tools](/packages/grok/server-tools)
