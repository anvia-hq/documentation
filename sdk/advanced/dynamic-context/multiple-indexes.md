# Multiple indexes

Add several context indexes when an agent needs independent knowledge sources with different retrieval rules.

## 1. Create each context entry separately

```ts
import { Agent, createVectorContext } from '@anvia/core';
import { vectorFilter } from '@anvia/core/vector-store';
const publicDocs = createVectorContext({
    store: publicDocsIndex,
    model: embeddingModel,
    topK: 4,
    minScore: 0.72,
    filter: vectorFilter.eq('published', true)
});
const supportPolicy = createVectorContext({
    store: policyIndex,
    model: embeddingModel,
    topK: 2,
    minScore: 0.78,
    filter: vectorFilter.and(vectorFilter.eq('audience', 'support'), vectorFilter.eq('region', user.region)),
    format: (result) => ({
        id: `policy:${result.id}`,
        text: `Source: Internal policy\n\n${String(result.document)}`,
    })
});
const agent = new Agent({
    id: 'support',
    model,
    instructions: 'Use public documentation and applicable support policy.',
    context: [publicDocs, supportPolicy],
});
```

Anvia searches each vector context for the turn and appends its formatted matches in context order. Each entry keeps its own `topK`, `minScore`, filter, and formatter.

## 2. Budget the combined context

The maximum retrieved document count is the sum of the entries' `topK` values. The example can add up to six documents per turn.

Use smaller limits for secondary sources. More results can bury the strongest evidence and consume the completion model's context window without improving the answer.

## 3. Separate sources when governance differs

Separate indexes are useful when sources have different permissions, tenant scopes, embedding models, vector-store adapters, update schedules, record shapes, or relevance thresholds.

Use one index when documents share the same lifecycle and access policy. A metadata filter is usually simpler than splitting an otherwise uniform corpus.

## 4. Preserve source identity

Give each formatted result a recognizable ID and source label. This helps the model distinguish public documentation from internal policy and makes retrieval traces easier to inspect.

Test and tune every source independently. If one source dominates with weak matches, raise its `minScore` or reduce its `topK` without changing stronger sources. Run separate permission tests because each vector context is an independent path into the model request.
