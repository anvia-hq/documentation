# Capabilities

`@anvia/jev` provides a typed-decision model adapter and model listing.

| Capability | Support |
| --- | --- |
| `choice` questions | Native (`Choice`) |
| `score` questions | Native (`Score`) |
| `check` questions | Native (`Noul`) |
| `multiLabel` questions | Composed from one `Noul` per label |
| Mixed question types in one request | Yes |
| Token usage | Normalized from input and output tokens |
| Raw SDK result | Returned as `rawResponse` |
| Model listing | Yes |
| Completion, streaming, tools | Not implemented |
| Embeddings, OCR, media | Not implemented |

## Mapping

| Anvia question | Jev request | Mapping |
| --- | --- | --- |
| `choice` | `Choice` | Options become criteria. Choice, probabilities, and confidence are preserved. |
| `multiLabel` | One `Noul` per label | Independent checks share the request. The inclusive threshold selects labels. |
| `score` | `Score` | The rubric becomes criteria. Numbered probabilities become an array in rubric order. |
| `check` | `Noul` | `noul` becomes `probability`. |

Mixed questions share one SDK call. Each extra multi-label option adds a Noul question and may increase billed usage. Generated wire IDs prevent collisions with application question names, and answers use your original names.

## Limits

Choice supports at most 255 options and score at most 10 levels. They are declared on the model and checked by `decide()` before network work. Unknown limits for questions per request and multi-label options are omitted.

## Encoding

Numeric and boolean state and criteria are represented as `{ value }`, because the SDK's entry type accepts strings, objects, arrays, and null.

## Score validation

A score response must include a legend with exactly the numbered rubric levels and descriptions sent to Jev. A missing or mismatched legend raises `DecisionProviderOutputError`. Property order does not affect matching; array order does. Validated answers keep the original rubric, including numeric and boolean levels before wrapping.

## Errors

- SDK failures propagate, except that an SDK timeout becomes an error named `TimeoutError` so Core's default retry policy treats it as transient.
- A caller abort becomes an `AbortError`.
- Invalid answer envelopes, unknown options, invalid probabilities, mismatched legends, and invalid usage throw `DecisionProviderOutputError`.
- Model-listing failures become `ModelListingError`.

## Unsupported surfaces

The adapter exposes no completion, embedding, OCR, or media factory. Use another Anvia provider for agents and retrieval, or the official SDK directly for TypeSafe-native surfaces.
