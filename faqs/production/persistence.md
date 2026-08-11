# What does Anvia persist?

Only the state connected to a configured store. Anvia does not silently turn every runtime event into durable application data.

## Persistence surfaces

| Surface | Typical data | Ownership |
| --- | --- | --- |
| Agent memory | Sessions, messages, errors, and optional compaction state | A configured memory adapter |
| Vector retrieval | Documents, embeddings, metadata, and index configuration | A vector-store adapter and its backend |
| Resumable streams | Event positions and stream state | A `ResumableStreamStore` |
| Studio | Local sessions, traces, pipeline logs, and runs | In-memory or configured Studio stores |
| Lens | Operational telemetry, evaluations, datasets, and workspace state | Lens deployment and retention policy |

An in-memory implementation is useful for tests and local development but disappears on restart and cannot coordinate several application instances.

Memory is model context, not a complete audit log. Its configured save policy decides which runtime messages are appended. Likewise, a resumable stream store retains transport events; it does not by itself restart model or tool execution after the worker process dies.

## Production ownership

The application must provision schemas and indexes where required, apply migrations, back up data, enforce tenant access, select retention, and test upgrades. Automatic table, collection, or index creation varies by adapter; review its package guide before deciding whether startup code or migrations own the schema.

See [memory adapters](/sdk/memory/store-adapters), [vector stores](/sdk/knowledges/vector-stores), [resumable streams](/sdk/streaming/resumable-streams), and the [package catalog](/packages/catalog).
