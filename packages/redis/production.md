# Production

- Inject an already-connected client so the application can own reconnect and shutdown.
- Require RediSearch support and validate the index before startup.
- Provision and tune HNSW through infrastructure.
- Choose a collision-free prefix and define corpus cleanup.
- Configure Redis persistence and eviction so vector keys are not unexpectedly lost.
- Monitor memory for vectors, hashes, indexes, and multi-embedding growth.

`RedisVectorClient.close()` quits the adapter-created client, and `nativeClient()` exposes it. Lifecycle-managed services can still inject an already-connected client and own reconnect and shutdown themselves.

No TTL is applied. If retention requires expiration, ensure index consistency and logical-document cleanup are designed together rather than expiring arbitrary chunks.
