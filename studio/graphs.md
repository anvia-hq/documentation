# Graph explorer

Studio can visualize any knowledge graph that implements the provider-neutral `GraphExplorer`
contract. Managed and existing registrations from `@anvia/neo4j` and `@anvia/memgraph` can be
registered directly.

## Register a graph

```ts
import { Studio } from '@anvia/studio'

const studio = new Studio([agent], {
  graphs: [
    {
      id: 'support',
      name: 'Support knowledge graph',
      description: 'Products, incidents, and their relationships.',
      graph,
    },
  ],
})

studio.start({ hostname: '127.0.0.1', port: 4021 })
```

Each graph ID must be non-empty and unique. Open `/graphs` to select a registration.

## Explore safely

The browser starts with a bounded overview. Filter by node or relationship type, search the loaded
view, select a node to inspect its public identity and properties, or expand its neighborhood.

Studio forwards only the portable overview and expansion requests. It does not accept raw Cypher.
The shared limits cap a response at 500 nodes and 1,000 relationships, expansion depth at 4, and
roots at 20. Adapters can truncate earlier and report which result sets were limited.

Stored embeddings and reserved Anvia properties are omitted by the adapters. Explorer IDs remain
provider-specific and are suitable only for expanding the current view; they are not stable
application identifiers.

Graph registration gives Studio read access through `explore()`. It does not grant ingestion or
arbitrary database mutation APIs.

See [`@anvia/graph` exploration](/packages/graph/ingestion-and-exploration) and the adapter guides
for database-specific configuration.
