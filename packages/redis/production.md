# Production

- Inject an already-connected client so the application can own reconnect and shutdown.
- Require RediSearch support and validate the index before startup.
- Provision and tune HNSW through infrastructure.
- Choose a collision-free prefix and define corpus cleanup.
- Configure Redis persistence and eviction so vector keys are not unexpectedly lost.
- Monitor memory for vectors, hashes, indexes, and multi-embedding growth.

The adapter-created client is not exposed for explicit close. Lifecycle-managed services should inject one and call the Redis client's shutdown method themselves.

No TTL is applied. If retention requires expiration, ensure index consistency and logical-document cleanup are designed together rather than expiring arbitrary chunks.
