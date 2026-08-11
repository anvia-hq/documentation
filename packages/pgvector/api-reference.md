# @anvia/pgvector API reference

All public symbols are exported from `@anvia/pgvector`.

```ts
import {
  filterToPgVectorWhere,
  PgVectorIndex,
  PgVectorStore,
  type PgClientLike,
  type PgVectorDistance,
  type PgVectorStoreConnectOptions,
  type PgVectorWhere,
} from '@anvia/pgvector'
```

## filterToPgVectorWhere

```ts
function filterToPgVectorWhere(
  filter: VectorFilter | undefined,
  startIndex?: number,
): PgVectorWhere | undefined
```

Returns parameterized SQL and values for an Anvia vector filter. `startIndex` controls the first PostgreSQL placeholder number.

## PgVectorStore

```ts
class PgVectorStore<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> {
  static connect<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: PgVectorStoreConnectOptions,
  ): Promise<PgVectorStore<T, Metadata>>

  upsertDocuments(
    documents: Array<EmbeddedDocument<T, Metadata>>,
  ): Promise<void>

  index(model: EmbeddingModel): PgVectorIndex<T, Metadata>
}
```

## PgVectorIndex

```ts
class PgVectorIndex<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> implements VectorSearchIndex<T, Metadata> {
  constructor(
    model: EmbeddingModel,
    client: PgClientLike,
    tableName: string,
    distance: PgVectorDistance,
  )

  search(request: VectorSearchRequest): Promise<Array<VectorSearchResult<T, Metadata>>>
  searchIds(request: VectorSearchRequest): Promise<Array<{ score: number; id: string }>>
  asTool(options: VectorSearchToolOptions): Tool<{ query: string; topK?: number }, unknown>
}
```

## Types

```ts
type PgVectorDistance = 'cosine' | 'l2' | 'innerProduct'

type PgVectorWhere = {
  sql: string
  values: unknown[]
}

type PgClientLike = {
  query(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: Record<string, unknown>[] }>
}

type PgVectorStoreConnectOptions = {
  client?: PgClientLike
  connectionString?: string
  tableName: string
  vectorSize: number
  createIfMissing?: boolean
  distance?: PgVectorDistance
}
```

Return to the [package guide](/packages/pgvector).
