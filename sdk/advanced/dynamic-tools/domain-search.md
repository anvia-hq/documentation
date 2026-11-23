# Domain search

A tool index ranks generic tools by their names and descriptions, so a flat catalog can hide the one tool a
user needs: a query about a deployment checklist never reaches a tool named `search_runbooks`. `searchTool()`
turns the **entries** into the search space and gives the model one tool that returns matching text.

## 1. Create a search tool

```ts anvia-check domain-search-example
import { searchTool } from '@anvia/core/tool'

export const runbookSearch = searchTool({
  name: 'search_runbooks',
  description: 'Search operational runbooks and return the matching procedures.',
  entities: [
    {
      id: 'deploy-checklist',
      text: 'Deployment checklist: freeze, migrate, deploy, verify, unfreeze.',
      detail: 'runbooks/deploy.md',
      metadata: { team: 'platform' },
    },
    {
      id: 'rollback',
      text: 'Roll back a failed deployment and verify the previous version.',
      detail: 'runbooks/rollback.md',
      metadata: { team: 'platform' },
    },
  ],
})
```

Register the returned index through `Agent.tools`:

```ts
const agent = new Agent({ id: 'ops', model, tools: [runbookSearch] })
```

`searchTool()` returns a `ToolIndex`, so it registers through `Agent.tools` like any other index. Each
`SearchEntity` has an `id`, the `text` the model matches against (title, summary, aliases), an optional
`detail` returned on a hit (the body, path, or command), and optional `metadata`. `entities` may be an array or
a promise that resolves once on first use.

## 2. Choose lexical or semantic matching

Without a `model`, matching is lexical: it scores vocabulary overlap. Supplying an `EmbeddingModel` makes it
semantic. `topK` defaults to 5, and `minScore` is semantic-only because a vocabulary score is not comparable to
an embedding score; `minScore` without a model throws.

```ts
const semanticSearch = searchTool({
  name: 'search_policies',
  entities: loadPolicies(), // Promise<readonly SearchEntity[]>
  model: embeddingModel,
  topK: 3,
  minScore: 0.7,
})
```

A lexical or semantic search that finds nothing returns an empty result; with `minScore`, weak hits are dropped
before formatting.

## 3. Format the result

The default format renders one block per hit. Override `format` to include `detail`, links, or application
context:

```ts
const search = searchTool({
  name: 'search_adr',
  entities: adrEntries,
  format: (hits) =>
    hits.length === 0
      ? 'No architecture decisions matched.'
      : hits.map((hit) => `${hit.text}\n${hit.detail ?? ''}`).join('\n\n'),
})
```

Keep the tool's parameter description generic. A tool definition is built before the model call, so the “current
query” it can render is the turn's text, not what the model typed into the tool arguments.

## 4. Know what the agent records

The agent calls the index on eligible turns and emits a `tool_selection` event listing the offered tools and the
matching entries with their scores. Persisted durable turns record the selection and reuse it on replay without
searching again.

## 5. Keep entries current

Rebuild or re-embed when entry text, IDs, or metadata change. A hit whose ID no longer exists is skipped by the
runtime, so a stale index silently loses results instead of failing loudly. Evaluate retrieval with real user
phrasing before tuning `topK` or `minScore`.

Next, revisit [tool index](/sdk/advanced/dynamic-tools) or tune [embedding text](/sdk/advanced/dynamic-tools/embedding-text).
