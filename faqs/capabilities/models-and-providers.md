# Which models and providers can I use?

Anvia is provider-neutral, but support is not universal. A provider package exposes one or more model families, and each concrete model, endpoint, account, and region may support a different subset of features.

## Which model family do I need?

| Work | Model family |
| --- | --- |
| Text generation, agents, tools, or structured responses | [Completion model](/sdk/models/completion) |
| Semantic search and retrieval | [Embedding model](/sdk/models/embeddings) |
| Image creation | [Image generation](/sdk/models/image-generation) |
| Speech or audio creation | [Audio generation](/sdk/models/audio-generation) |
| Audio-to-text | [Transcription](/sdk/models/transcription) |
| Document or image text extraction | [OCR](/sdk/models/ocr) |

A completion provider does not automatically provide embeddings, transcription, or media generation. These are separate Core interfaces and provider factories.

## Is a supported adapter enough to guarantee a feature?

No. Adapter support means Anvia can represent the capability. The upstream model may still reject streaming, tools, schemas, media, or a parameter for the selected model ID or account.

Use the [provider capability matrix](/sdk/providers/capability-matrix) to shortlist providers, inspect the model's declared capabilities, and run a smoke test against the exact production configuration.

## Can I switch providers without changing application code?

Core workflows can depend on provider-neutral interfaces, so switching is usually localized to model construction. Provider-specific options, response details, and capability differences still need review.

Start with [Choose a provider](/sdk/providers/choose-a-provider). Package setup is available for [OpenAI](/packages/openai), [Anthropic](/packages/anthropic), [Gemini](/packages/gemini), [Mistral](/packages/mistral), and [Grok](/packages/grok).

Keep provider credentials on the server and treat model capability declarations as configuration checks, not live network probes.
