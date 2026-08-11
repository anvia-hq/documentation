# Knowledges

Knowledge connects an agent to relevant source material without placing the entire corpus in every prompt.

## Explore knowledge

| Page | Learn how to |
| --- | --- |
| [Load documents](/sdk/knowledges/load-documents) | Read, normalize, and chunk source files. |
| [Embeddings](/sdk/knowledges/embeddings) | Turn documents into searchable vectors. |
| [Vector stores](/sdk/knowledges/vector-stores) | Build, query, update, and choose an index. |
| [Metadata filters](/sdk/knowledges/metadata-filters) | Enforce tenant, visibility, and content boundaries. |
| [Automatic retrieval](/sdk/knowledges/automatic-retrieval) | Add relevant documents to every agent turn. |
| [Search tools](/sdk/knowledges/search-tools) | Let the model decide when and how to search. |

## The retrieval flow

```text
Sources → load and chunk → embed → index → filter and search → model context
```

Ingestion prepares the index outside the request path. At runtime, the current prompt searches that prepared index and sends only relevant documents to the model.

## Choose how retrieval runs

Use [automatic retrieval](/sdk/knowledges/automatic-retrieval) when most prompts need supporting knowledge. Use a [search tool](/sdk/knowledges/search-tools) when retrieval is optional or the model may need to refine its query.

Use static agent [context](/sdk/agents/context) instead when the source set is small, stable, and safe to include in every run. Use [tools](/sdk/tools) for live account data, permissions, or actions rather than treating a vector index as an operational database.
