# Anvia and direct provider SDKs

_Last reviewed: 24 November 2026, against `openai` 7.63.0, `@anthropic-ai/sdk` 1.13.0, `@google/genai` 3.6.1, `@mistralai/mistralai` 3.5.0, and Anvia SDK revision `7aa42c0a`._

A direct provider SDK is often the correct choice. It gives an application the vendor’s native request and response types, endpoint coverage, errors, pagination, streaming helpers, and newly released features without waiting for a framework adapter. Anvia provider packages use those SDKs behind normalized model contracts when portability and shared runtime behavior are more valuable than exposing every vendor surface.

## At a glance

| Area | Direct provider SDK | Anvia provider packages |
| --- | --- | --- |
| Model layer | One vendor’s complete native API and types | Normalized completion, embedding, typed-decision, image-generation, speech-generation, transcription, and model-listing contracts, plus provider-specific models such as Mistral OCR |
| Agent loop | Application-owned | [`Agent`](/sdk/agents), [pipelines](/sdk/pipelines), and experimental [durable runs](/sdk/advanced/durable-execution) |
| New endpoints | Available when the vendor ships them | Available after an adapter maps them, or through the injected native client |
| Retries | Configured on the native client | Managed clients disable native retries; configure them on an injected client or in application code |
| Observability | Application-owned | Shared lifecycle events for Studio, OpenTelemetry, Langfuse, and Lens |

## What direct SDKs do especially well

Official SDKs are the shortest route to a provider’s complete API:

- OpenAI’s [official JavaScript/TypeScript library](https://github.com/openai/openai-node) is generated from OpenAI’s OpenAPI specification and covers the Responses API, streaming, file uploads, and the rest of the API surface.
- Anthropic’s [official TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) exposes Messages, token counting, streaming helpers, and provider-native types. Version 1.0 was released in October 2026.
- Google’s [`@google/genai` SDK](https://googleapis.github.io/js-genai/release_docs/index.html) covers the Gemini Developer API and Gemini Enterprise Agent Platform (formerly Vertex AI), including models, chats, files, caches, live sessions, and built-in tools.
- Mistral’s [official TypeScript client](https://github.com/mistralai/client-ts), published as `@mistralai/mistralai`, exposes its platform APIs directly.

When a provider ships a new endpoint or an unusual request option, its SDK and API documentation are the authoritative source. A normalized adapter may not expose that capability yet, and some provider concepts have no honest cross-provider equivalent.

## Where the overlap is real

Both direct SDKs and Anvia provider packages can offer:

- typed model requests and responses;
- streaming;
- tool or function calling;
- structured output;
- embeddings and multimodal APIs where the provider supports them;
- custom base URLs and headers through provider configuration.

Anvia does not replace the underlying service. Its provider adapters map selected native operations into Anvia’s completion, embedding, typed-decision, image-generation, speech-generation, transcription, and model-listing contracts. Capabilities without a shared contract stay provider-specific: for example, [Mistral OCR](/packages/mistral/ocr) is a Mistral model, not a core OCR contract.

## The architectural difference

With a direct SDK, application code owns the model loop and provider data structures. Switching providers means rewriting that layer or maintaining an application-defined interface. In return, the code can use every native field and endpoint without translation.

With Anvia, application code targets provider-neutral contracts. The same agent, tool, memory, pipeline, and stream lifecycle can use a model created by [`@anvia/openai`](/packages/openai), [`@anvia/azure`](/packages/azure), [`@anvia/anthropic`](/packages/anthropic), [`@anvia/gemini`](/packages/gemini), [`@anvia/mistral`](/packages/mistral), or [`@anvia/grok`](/packages/grok); [`@anvia/jev`](/packages/jev) supplies typed-decision models. Provider-specific `providerOptions` remain available for many model requests, but they do not turn an unsupported endpoint into a supported contract.

Anvia also supplies behavior above a model call: multi-turn agent execution, memory, retrieval, lifecycle callbacks, approvals, pipelines, durable runs, normalized events, evaluations, Studio, and observability adapters. A direct SDK intentionally leaves those application/runtime decisions to you.

## Choose Anvia when

Anvia is a good fit when:

- the same agent or pipeline may use more than one provider;
- tools, memory, events, usage, and failure behavior need a shared runtime contract;
- provider choice should remain an injected server dependency;
- model output must flow through the same Studio and observability instrumentation;
- several provider capabilities need consistent interfaces across the application;
- the team wants to test the runtime with fake or substituted model implementations.

## Choose a direct SDK when

A direct SDK is a strong fit when:

- the product is committed to one provider and portability is not a requirement;
- a native endpoint or field is not exposed by an Anvia adapter;
- the application only needs a few model calls and already owns the surrounding loop;
- vendor-specific streaming events or error objects must remain intact;
- the provider’s release cadence requires immediate feature access;
- an existing codebase already has a stable internal model abstraction.

## Can they coexist?

Yes, and this is often practical. Use Anvia for supported normalized operations and call the same SDK directly for provider-native features.

Anvia provider clients accept an already initialized official client. In this example, `file` is an application-supplied upload, such as a `File` or a stream from `fs.createReadStream()`:

```ts
import OpenAI from 'openai'
import { OpenAIClient } from '@anvia/openai'

const native = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 2,
})

const anvia = new OpenAIClient({ client: native })

const agentModel = anvia.completionModel({
  modelId: 'gpt-5.6-sol',
  api: 'responses',
})

const nativeFile = await native.files.create({
  file,
  purpose: 'fine-tune',
})
```

`AzureOpenAIClient`, `AnthropicClient`, `GeminiClient`, `MistralClient`, `GrokClient`, and `JevClient` likewise accept their documented underlying client objects. This keeps credentials, transport, and connection configuration consistent while preserving native access.

When Anvia creates the native client itself from an API key, the OpenAI, Azure OpenAI, Anthropic, Grok, Mistral, and Jev clients turn off the SDK’s automatic retries. To use the vendor SDK’s retry policy, configure it on a client you inject, as above, or retry in application code. Jev model listing disables retries even on an injected client.

When migrating direct calls into Anvia, start with a request already covered by a provider model contract. Compare normalized content, usage, tool calls, and streaming behavior in tests. Keep unsupported native operations direct instead of hiding them behind an incomplete compatibility wrapper.

## Related Anvia pages

- [Choose a provider](/sdk/providers/choose-a-provider)
- [Provider capability matrix](/sdk/providers/capability-matrix)
- [Packages feature matrix](/packages/feature-matrix)
- [OpenAI package API](/packages/openai/api-reference)
- [Gemini package API](/packages/gemini/api-reference)

## Sources (reviewed 2026-11-24)

- OpenAI: [openai-node repository](https://github.com/openai/openai-node), [`openai` on npm](https://www.npmjs.com/package/openai).
- Anthropic: [anthropic-sdk-typescript repository](https://github.com/anthropics/anthropic-sdk-typescript), [2026-10-21 migration guide](https://platform.claude.com/docs/en/api/migration-2026-10-21#typescript), [`@anthropic-ai/sdk` on npm](https://www.npmjs.com/package/@anthropic-ai/sdk).
- Google: [`@google/genai` reference](https://googleapis.github.io/js-genai/release_docs/index.html), [`@google/genai` on npm](https://www.npmjs.com/package/@google/genai).
- Mistral: [client-ts repository](https://github.com/mistralai/client-ts), [`@mistralai/mistralai` on npm](https://www.npmjs.com/package/@mistralai/mistralai).
- Anvia: provider package source at revision `7aa42c0a` (`@anvia/openai` 1.4.1, `@anvia/azure` 0.1.12, `@anvia/anthropic` 1.4.1, `@anvia/gemini` 1.2.1, `@anvia/mistral` 1.3.1, `@anvia/grok` 1.2.1, `@anvia/jev` 0.3.1) and the linked Anvia documentation.
