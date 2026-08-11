# Feature matrix

Use this matrix to find the package family that owns a capability. A check means the package exposes a first-class implementation, not merely that it can be combined with the feature.

## Application runtime

| Package | Agents and models | Streaming transport | React hooks | UI components |
| --- | :---: | :---: | :---: | :---: |
| `@anvia/core` | ✓ | — | — | — |
| `@anvia/server` | — | ✓ | — | — |
| `@anvia/react` | — | Client | ✓ | — |
| `@anvia/react-ui` | — | Client | — | ✓ |

## Model integrations

| Package | Hosted completion models | Embeddings | Local execution |
| --- | :---: | :---: | :---: |
| `@anvia/openai` | ✓ | ✓ | — |
| `@anvia/anthropic` | ✓ | — | — |
| `@anvia/gemini` | ✓ | ✓ | — |
| `@anvia/mistral` | ✓ | ✓ | — |
| `@anvia/grok` | ✓ | — | — |
| `@anvia/fastembed` | — | ✓ | ✓ |
| `@anvia/transformers` | — | ✓ | ✓ |

Provider-specific support for images, audio, transcription, OCR, tools, reasoning, and structured output varies by adapter and model. Check the provider page before selecting a model.

## Persistence and retrieval

| Family | Session memory | Vector retrieval | Caller-managed service |
| --- | :---: | :---: | :---: |
| `@anvia/memory-*` | ✓ | — | Depends on adapter |
| `@anvia/chroma`, `@anvia/lancedb`, `@anvia/milvus` | — | ✓ | Depends on adapter |
| `@anvia/pgvector`, `@anvia/pinecone`, `@anvia/qdrant` | — | ✓ | ✓ |
| `@anvia/redis`, `@anvia/weaviate` | — | ✓ | ✓ |

## Observability

| Package | Structured logs | Traces | Evaluation reporting | Datasets | Prompt management |
| --- | :---: | :---: | :---: | :---: | :---: |
| `@anvia/logger` | ✓ | — | — | — | — |
| `@anvia/otel` | OTel logs | ✓ | ✓ | — | — |
| `@anvia/lens` | Export | ✓ | ✓ | Read | — |
| `@anvia/langfuse` | Export | ✓ | ✓ | Read/write | ✓ |

## Development

| Package | Inspect agents | Run pipelines | Isolated commands | Persistent workspace |
| --- | :---: | :---: | :---: | :---: |
| `@anvia/studio` | ✓ | ✓ | Through sandbox adapters | — |
| `@anvia/sandbox` | — | — | ✓ | Optional |

