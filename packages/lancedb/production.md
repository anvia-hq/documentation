# Production

- Use an explicit persistent URI or inject an application-owned connection.
- Pre-create tables and indexes for predictable startup and query plans.
- Keep embedding dimensions and distance configuration stable.
- Build deletion and deduplication into refresh jobs because ingestion adds rows.
- Monitor storage amplification from chunks and multi-embedding documents.
- Back up or replicate the table according to your LanceDB deployment.

The default home-directory URI is unsuitable for ephemeral containers. The adapter does not expose connection shutdown or storage maintenance. Own lifecycle, optimization, and disaster recovery outside the request path.

For ingestion design, see [Load documents](/sdk/knowledges/load-documents).
