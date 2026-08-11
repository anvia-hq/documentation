# Capabilities

`@anvia/transformers` is a focused local dense-embedding adapter.

| Capability | Support |
| --- | --- |
| Dense text embeddings | Yes |
| Custom feature-extraction models | Yes |
| Mean or CLS pooling | Yes |
| Vector normalization | Configurable |
| Injected extraction pipeline | Yes |
| Sparse embeddings | No |
| Completion or media models | No |

## Model contract

`TransformersEmbeddingModel` implements Anvia’s `EmbeddingModel`. It returns one `{ document, vector }` entry per input and returns an empty array without invoking the pipeline for empty input.

The default factory loads `@huggingface/transformers` with task `feature-extraction`. The adapter calls the pipeline with the complete input array, selected pooling, and normalization settings, then parses `tolist()` output.

## Validation

The result must be an array with exactly one numeric array per input. Invalid vector containers, non-number entries, and count mismatches throw. The adapter does not independently verify a fixed dimension across rows, so application/index validation should enforce the required collection dimension.

## What it does not own

The package does not split documents, create collections, add sparse signals, rerank results, or manage model cache policy. It does not expose generation models. Use Core loaders/embedding helpers and a vector-store adapter around it.
