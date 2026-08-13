# Build a basic RAG pattern

**Level:** Pattern · **Estimated time:** 30 minutes

## Outcome

Embed application documents, search them for a question, and give only the retrieved text to an
agent. This version is intentionally local and rebuilds its in-memory index on every start.

## When to use it

Use this to learn or evaluate retrieval on a small public corpus. Use a durable adapter and an
ingestion job for production. Add authorization before indexing private or tenant-owned content.

## Request flow

documents → `embedDocuments` → `InMemoryVectorStore` → `index(model).search(...)` → bounded context
→ `agent.prompt(...).send()`.

## Setup

```sh
pnpm add @anvia/core @anvia/openai @anvia/transformers
```

## Index the corpus

```ts
import { embedDocuments } from "@anvia/core/embeddings";
import { InMemoryVectorStore } from "@anvia/core/vector-store";
import { createTransformersEmbeddingModel } from "@anvia/transformers";

type Note = { id: string; title: string; text: string; source: string };
const embeddingModel = await createTransformersEmbeddingModel();
const embedded = await embedDocuments(embeddingModel, notes, {
  id: (note) => note.id,
  content: (note) => `${note.title}\n${note.text}`,
  metadata: (note) => ({ source: note.source }),
});
const index = InMemoryVectorStore.fromDocuments(embedded).index(embeddingModel);
```

## Retrieve, then answer

```ts
const matches = await index.search({ query: question, topK: 4 });
const context = matches.map((match) => [
  `Source: ${match.metadata?.source ?? match.id}`,
  match.document.text,
].join("\n")).join("\n\n---\n\n");

const response = await agent.prompt([
  "Answer only from the context. If it is insufficient, say so.",
  `Question: ${question}`,
  `Context:\n${context}`,
].join("\n\n")).send();
```

`agent` is an ordinary server-side `Agent` result. Manual retrieval makes the boundary
visible; use `dynamicContext` when automatic prompt-time retrieval better fits your application.

## Run and expected behavior

Ask a question represented in the notes, then an unrelated question. The first answer should name
an actual source; the second should say the context is insufficient. Ranking and prose vary, so
assert source eligibility and grounded behavior rather than exact wording.

## Failure cases

Empty corpora, embedding dimension changes, duplicate IDs, low-quality chunks, provider failures,
and irrelevant high-scoring matches all need explicit handling. Retrieval relevance is not proof
that a claim is correct.

## Security and ownership

The application owns corpus provenance, access policy, deletion, freshness, chunking, and source
display. Indexed documents are untrusted prompt content and cannot grant permissions or authorize
tools.

## Production changes and tests

Move ingestion out of startup, persist embeddings, record model/version, add thresholds and
evaluation sets, and cap context tokens. Test known queries, insufficient context, stale/deleted
documents, malicious instructions, embedding failures, and source citation membership.

## Runnable references

- [Embed and search](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/01-embed-and-search.ts)
- [OpenRouter RAG](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/03-openrouter-rag.ts)

## Extensions

Add [metadata filters](/examples/knowledge-and-data/metadata-filters), a durable [vector store
adapter](/examples/knowledge-and-data/vector-store-adapters), reranking, and retrieval evaluations.
