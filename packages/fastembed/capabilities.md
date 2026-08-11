# Capabilities

`@anvia/fastembed` implements local dense and sparse Anvia embedding contracts.

| Capability | Support |
| --- | --- |
| Dense document/query vectors | `FastEmbedEmbeddingModel` |
| Sparse passage vectors | `FastEmbedSparseEmbeddingModel.embedTexts()` |
| Sparse query vectors | `FastEmbedSparseEmbeddingModel.embedQuery()` |
| Hybrid retrieval | Combine dense and sparse with a capable vector store |
| Remote API calls | None after model assets are available locally |
| Browser runtime | Not the intended target |

## Dense embeddings

The default model is `fast-bge-small-en-v1.5`. The adapter accepts FastEmbed’s non-custom model enum values, batches 256 inputs by default, and returns one Anvia `Embedding` per input.

Runtime batches may contain plain arrays or typed arrays. The adapter validates the batch/vector shapes and final output count.

## Sparse embeddings

The default sparse model is `prithivida/Splade_PP_en_v1`. Passage embedding accepts batches; query embedding accepts one query. Returned parallel `indices` and `values` arrays must be numeric and have equal lengths.

Sparse output is useful only with a store and search configuration that understands sparse or hybrid vectors. Qdrant can combine named dense and sparse vectors with reciprocal-rank fusion.

## What the package does not own

FastEmbed does not split documents, select vector-store metadata, schedule ingestion, create a collection, or authorize retrieval. It also does not expose completion or media models. Those concerns remain with Core, the selected store adapter, and application code.

## Failure behavior

Initialization rejects when the native runtime or model load fails. Embedding rejects invalid batch containers, malformed vectors, mismatched sparse arrays, and a final count different from the number of inputs. Empty input returns an empty array without invoking the runtime.
