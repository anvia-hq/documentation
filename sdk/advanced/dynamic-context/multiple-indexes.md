# Multiple indexes

Register multiple indexes when an agent needs independent knowledge sources with different retrieval rules.

## Add each source separately

```ts
import { AgentBuilder } from '@anvia/core'
import { vectorFilter } from '@anvia/core/vector-store'

const agent = new AgentBuilder('support', model)
  .instructions(
    'Answer from public documentation and applicable support policy.',
  )
  .dynamicContext(publicDocsIndex, {
    topK: 4,
    threshold: 0.72,
    filter: vectorFilter.eq('published', true),
  })
  .dynamicContext(policyIndex, {
    topK: 2,
    threshold: 0.78,
    filter: vectorFilter.and(
      vectorFilter.eq('audience', 'support'),
      vectorFilter.eq('region', user.region),
    ),
  })
  .build()
```

Anvia searches every registered index before the model turn and appends the formatted matches. Each index keeps its own `topK`, threshold, filter, and formatter.

## Budget the combined result

The maximum retrieved document count is the sum of each index's `topK`. In the example, the model can receive up to six documents per turn.

Set smaller limits for secondary sources. More results do not automatically produce a better answer; they can bury the strongest evidence and consume the model's context window.

## Use separate indexes when boundaries differ

Separate indexes are useful when sources have different:

- permissions or tenant scopes
- embedding models or vector-store adapters
- update schedules
- document shapes and formatters
- relevance thresholds

Use one index when the documents share the same lifecycle and access policy. Metadata filters are usually simpler than splitting an otherwise uniform corpus.

## Keep source identity visible

Format each source with a recognizable ID and label:

```ts
const policyOptions = {
  topK: 2,
  threshold: 0.78,
  format(result) {
    return {
      id: `policy:${result.id}`,
      text: `Source: Internal policy\n\n${String(result.document)}`,
    }
  },
} satisfies Parameters<AgentBuilder['dynamicContext']>[1]
```

Clear source identity helps the model distinguish product documentation from internal policy and makes retrieval traces easier to inspect.

## Tune sources independently

Test which index supplied each answer. If one source dominates with weak matches, raise its threshold or reduce its `topK` instead of changing every index. Keep permission tests separate for each source because every registered index is an independent path into model context.

