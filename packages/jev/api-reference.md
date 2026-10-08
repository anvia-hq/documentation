# `@anvia/jev` API reference

Import every public symbol from `@anvia/jev`. The package has no public subpath exports.

## Client and model factory

```ts
type JevClientOptions =
  | { apiKey?: string; baseUrl?: string; headers?: Record<string, string>; client?: never }
  | { client: TypeSafeClient; apiKey?: never; baseUrl?: never; headers?: never }

class JevClient implements ModelListingClient {
  constructor(options: JevClientOptions)
  decisionModel(options: JevDecisionModelOptions): JevDecisionModelHandle
  listModels(options?: { abortSignal?: AbortSignal }): Promise<ModelList>
}

type JevDecisionModelOptions = { modelId: JevDecisionModelId }
type JevDecisionModelHandle = DecisionModel<unknown>
```

The constructor and factory require one options object. The model ID is explicit; there is no factory default. The handle is the Core `DecisionModel` contract. Its `provider` is `'jev'` and its `rawResponse` is the original SDK result.

## Declared capabilities

| Field | Value |
| --- | --- |
| `questionSupport` | `choice`, `score`, `check`: native. `multi-label`: composed. |
| `mixedQuestions` | `true` |
| `limits` | `maxChoiceOptions: 255`, `maxRubricLevels: 10` |

## Model IDs

```ts
const JEV_LATEST = 'jev-latest'
type KnownJevDecisionModelId = typeof JEV_LATEST
type JevDecisionModelId = ModelId<KnownJevDecisionModelId>
```

Known IDs provide autocomplete while other strings remain valid.

## Model listing

`listModels()` returns `{ data }` where each item has `id` and `name` set to the SDK model name, plus `description` and `type: 'decision'`. Failures throw `ModelListingError` with `provider: 'jev'`, except a caller abort, which rejects with an `AbortError`.

## Namespace

The `jev` namespace re-exports the same client, constants, and public types. It has no state of its own.

## Core decision API

Question helpers and operations are not exported from this package. Import `choice`, `multiLabel`, `score`, `check`, `decide`, `decideBatch`, the errors, and the types from `@anvia/core/decision` (also available from `@anvia/core`). See [Typed decisions](/sdk/decisions).
