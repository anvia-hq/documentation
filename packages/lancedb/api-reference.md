# @anvia/lancedb API reference

All public symbols are exported from `@anvia/lancedb`.

```ts
import {
  filterToLanceExpr,
  LanceDBVectorIndex,
  LanceDBVectorStore,
  type LanceDBConnectionLike,
  type LanceDBDistance,
  type LanceDBTableLike,
  type LanceDBVectorStoreConnectOptions,
} from '@anvia/lancedb'
```

## filterToLanceExpr

```ts
function filterToLanceExpr(
  filter: VectorFilter | undefined,
): string | undefined
```

Returns a LanceDB filter expression, or `undefined` when no filter is supplied.

## LanceDBVectorStore

```ts
class LanceDBVectorStore<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> {
  static connect<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: LanceDBVectorStoreConnectOptions,
  ): Promise<LanceDBVectorStore<T, Metadata>>

  upsertDocuments(
    documents: Array<EmbeddedDocument<T, Metadata>>,
  ): Promise<void>

  index(model: EmbeddingModel): LanceDBVectorIndex<T, Metadata>
}
```

## LanceDBVectorIndex

```ts
class LanceDBVectorIndex<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> implements VectorSearchIndex<T, Metadata> {
  constructor(
    model: EmbeddingModel,
    connection: LanceDBConnectionLike,
    tableName: string,
  )

  search(request: VectorSearchRequest): Promise<Array<VectorSearchResult<T, Metadata>>>
  searchIds(request: VectorSearchRequest): Promise<Array<{ score: number; id: string }>>
  asTool(options: VectorSearchToolOptions): Tool<{ query: string; topK?: number }, unknown>
}
```

## Types

```ts
type LanceDBDistance = 'cosine' | 'l2' | 'dot'

type LanceDBTableLike = {
  add(rows: Record<string, unknown>[]): Promise<unknown>
  search(vector: number[]): {
    limit(n: number): {
      filter(expr: string | undefined): Promise<unknown[]>
      toArray(): Promise<unknown[]>
    }
  }
  countRows(): Promise<number>
  delete(filter: string): Promise<unknown>
}

type LanceDBConnectionLike = {
  openTable(name: string): Promise<LanceDBTableLike>
  tableNames(): Promise<string[]>
  createTable(
    name: string,
    data: Record<string, unknown>[],
  ): Promise<LanceDBTableLike>
}

type LanceDBVectorStoreConnectOptions = {
  client?: LanceDBConnectionLike
  uri?: string
  tableName: string
  vectorSize: number
  createIfMissing?: boolean
  distance?: LanceDBDistance
}
```

Return to the [package guide](/packages/lancedb).
