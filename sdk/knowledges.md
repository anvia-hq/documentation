# Knowledges

Knowledge gives an agent access to a large document collection without sending the whole collection to the model. Anvia separates this into an ingestion path and a retrieval path:

```text
Ingestion: source files -> documents -> embeddings -> vector store
Runtime:   user prompt -> filtered search -> relevant documents -> model
```

Ingestion normally runs in a script, worker, or deployment job. Runtime retrieval should only search an index that is already prepared.

## 1. Prepare searchable documents

Load and chunk the source material, then create embeddings with stable IDs and filterable metadata:

```ts
import { readFile } from 'node:fs/promises';
import { chunkText } from '@anvia/core/documents';
import { embedDocuments } from '@anvia/core/embeddings';
import { InMemoryVectorStore } from '@anvia/core/vector-store';
const path = 'content/support/reset-links.md';
const text = await readFile(path, 'utf8');
const documents = chunkText({
    text,
    strategy: 'recursive',
    maxSize: 1600,
    overlap: 200,
    separators: ['\n\n', '\n', '. ', ' '],
}).map((chunk) => ({
    id: `${path}#chunk=${chunk.index}`,
    text: chunk.text,
    metadata: { source: path, start: chunk.start, end: chunk.end },
}));
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: documents,
    id: (document) => document.id,
    content: (document) => document.text,
    metadata: (document) => ({
        source: document.metadata.source,
        published: true,
    })
});
const store = InMemoryVectorStore.fromDocuments({ documents: embedded });
```

The in-memory store is useful for learning and tests. Use a persistent [vector-store adapter](/sdk/knowledges/vector-stores) for production data.

## 2. Connect retrieval to an agent

Use `createVectorContext()` when the agent should retrieve relevant documents before each model turn:

```ts
import { Agent, createVectorContext } from '@anvia/core'
import { vectorFilter } from '@anvia/core/vector-store'

const agent = new Agent({
  id: 'docs-support',
  model,
  instructions: 'Answer from the documentation. Say when the answer is not available.',
  context: [
    createVectorContext({
      store,
      model: embeddingModel,
      topK: 4,
      minScore: 0.72,
      filter: vectorFilter.eq('published', true),
    }),
  ],
})

const result = await agent.generate({
    prompt: 'How long does a reset link last?'
})
```

The index uses the current prompt as its search query. Only matching documents are added to the model request.

## 3. Choose the retrieval pattern

Use [automatic retrieval](/sdk/knowledges/automatic-retrieval) when knowledge is useful for most prompts. Use a [search tool](/sdk/knowledges/search-tools) when search is optional or the model may need to refine the query.

Use [Neo4j GraphRAG](/sdk/knowledges/neo4j-graph-rag) when typed relationships and bounded traversal add evidence that independent document similarity cannot represent.

Use static agent [context](/sdk/agents/context) for a small set of facts that should be present on every turn. Use an application [tool](/sdk/tools) for live records, permission checks, and actions.

Continue through the ingestion flow:

- [Load and chunk documents](/sdk/knowledges/load-documents)
- [Create embeddings](/sdk/knowledges/embeddings)
- [Store and search vectors](/sdk/knowledges/vector-stores)
- [Apply metadata filters](/sdk/knowledges/metadata-filters)
