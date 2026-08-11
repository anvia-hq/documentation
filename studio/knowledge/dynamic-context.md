# Dynamic context

The Dynamic Context view browses document chunks exposed by the vector indexes registered on Studio agents. It helps you verify index contents and metadata before debugging semantic selection in an agent run.

Open `http://localhost:4021/ui/knowledge/dynamic-context`.

## Register an index

```ts
const agent = new AgentBuilder('docs-support', model)
  .instructions('Answer from relevant documentation.')
  .dynamicContext(docsIndex, {
    topK: 4,
    threshold: 0.72,
    filter: vectorFilter.eq('product', 'platform'),
    format: (result) => ({
      id: result.id,
      text: result.document.text,
      additionalProps: {
        product: result.document.product,
        score: result.score,
      },
    }),
  })
  .build()
```

These options control runtime retrieval:

| Option | Effect during an agent turn |
| --- | --- |
| `topK` | Maximum number of matching chunks selected for a generation. |
| `threshold` | Rejects matches below the configured similarity score. |
| `filter` | Restricts the eligible index records before selection. |
| `format` | Converts a search result into the document sent to the model. |

Studio does not perform an arbitrary similarity search from this browser. It uses the optional index inspection contract to page through source items, applying the registration's filter. Runtime `topK` and threshold still govern prompt-time retrieval.

## Browse source items

Choose a source when the selected agent has several dynamic context registrations. Each source is identified by its registration order. Browse the returned items to inspect:

- the stable vector record ID;
- document text, when the stored document exposes it;
- the raw JSON document for other shapes;
- stored metadata returned by the index inspector.

Use **Load more** to follow the index cursor. When the inspector reports a total, Studio also uses it for the source item count.

## When chunks are not browseable

Search and inspection are separate index capabilities. A custom `VectorSearchIndex` can support runtime search without implementing `inspect(...)`. In that case the agent can retrieve normally, but Studio reports that the source does not expose browseable chunks.

This does not mean the index is empty or broken. Add an inspection adapter if browsing is useful, or validate actual runtime selection through [Retrieval evidence](/studio/knowledge/retrieval-evidence).

## Diagnose retrieval in the right order

| Symptom | Check first |
| --- | --- |
| Expected chunk is absent from the browser | Ingestion, chunking, upsert, registration filter, and selected source |
| Chunk exists but does not reach the generation | Query text, embedding model, threshold, `topK`, and filter |
| Correct chunk reaches the generation but answer is wrong | Instructions, surrounding messages, document formatting, and model output |

Studio is intentionally not an ingestion console. Build and update indexes with the patterns in [Add dynamic context](/sdk/advanced/dynamic-context/add-context), then restart or refresh Studio to inspect the registered source.
