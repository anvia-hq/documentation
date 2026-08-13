# Automatic retrieval

Use dynamic context when most prompts should receive a small set of relevant documents automatically.

## Add an index

```ts
import { Agent } from '@anvia/core'
import { vectorFilter } from '@anvia/core/vector-store'

const agent = new Agent({
  id: 'docs-support',
  model: model,
  instructions: 'Answer with retrieved documentation when it is relevant.',
  dynamicContexts: [{ index: docsIndex, topK: 4, threshold: 0.74, filter: vectorFilter.eq('published', true) }],
})
```

For every turn, Anvia extracts retrieval text from the current prompt, searches the index, applies its threshold and filter, and sends matching results as documents with the model request.

A later turn after a tool call can retrieve different documents because the runtime prompt has changed.

## Format retrieved documents

Use `format(...)` when a stored object needs a concise, source-aware shape.

```ts
const policyContext = {
  topK: 3,
  threshold: 0.76,
  format(result) {
    return {
      id: `policy:${result.id}`,
      text: [
        `Title: ${result.metadata?.title ?? 'Untitled'}`,
        `Source: ${result.metadata?.source ?? 'unknown'}`,
        '',
        String(result.document),
      ].join('\n'),
    }
  },
}
```

Keep the formatted context focused. Retrieval should not become an unbounded corpus dump.

## Tune with real prompts

Lower `topK` when extra context distracts the model. Raise `threshold` when weak matches appear. Improve chunking when answers span unrelated passages, and tighten filters when stale or unauthorized documents are eligible.
