# Production

- Use an explicit persistent URI or inject an application-owned connection.
- Pre-create tables and indexes for predictable startup and query plans.
- Keep embedding dimensions and distance configuration stable.
- Re-upserting a document ID replaces its rows; build deletion into refresh jobs for document IDs that leave the corpus.
- Monitor storage amplification from chunks and multi-embedding documents.
- Back up or replicate the table according to your LanceDB deployment.

The default home-directory URI is unsuitable for ephemeral containers. Call `close()` on the client to release connections the adapter created; injected connections are left open. Own storage maintenance, optimization, and disaster recovery outside the request path.

For ingestion design, see [Load documents](/sdk/knowledges/load-documents).
