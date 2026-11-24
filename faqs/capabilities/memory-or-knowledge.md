# Should I use memory or knowledge?

Use memory for the conversation the agent should remember across runs. Use knowledge for source material the agent should retrieve because it is too large, dynamic, or selective to include in every prompt.

| Question | Capability |
| --- | --- |
| “What did this user and assistant say earlier?” | [Memory](/sdk/memory) |
| “Which handbook section answers this question?” | [Knowledge](/sdk/knowledges) |
| “Which systems depend on this service?” | [Graph RAG](/sdk/knowledges/graph-rag) over a knowledge graph |
| “What is this account's current balance?” | An authorized [tool](/sdk/tools), not a vector store |
| “What small policy should every run receive?” | Static [agent context](/sdk/agents/context) |

## Can an agent use both?

Yes. A run can load prior messages from memory and retrieve relevant documents from knowledge. Keep their lifecycles separate: conversation retention and deletion often differ from corpus ingestion and re-indexing.

## Does memory scope enforce access?

No. A scope key selects stored history. The application must authenticate the request and verify that the caller may access that session. Choose an adapter in [Memory store adapters](/sdk/memory/store-adapters).

## Do knowledge filters enforce authorization?

Not by themselves. Metadata filters narrow retrieval, but application authorization must determine which tenant, visibility, and corpus constraints are allowed. See [Metadata filters](/sdk/knowledges/metadata-filters).

Knowledge quality also depends on document loading, chunking, embeddings, vector-store or graph configuration, and the selected model. `@anvia/graph` adds typed graph schemas, fact extraction, and graph search tools, with `@anvia/neo4j` or `@anvia/memgraph` as the store. Test retrieval and answer grounding together rather than treating the store adapter as a complete knowledge system.

See [Memory](/features/memory) and [Knowledge and RAG](/features/knowledge-and-rag).
