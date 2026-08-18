# Anvia and direct provider SDKs

_Last reviewed: August 2026_

A direct provider SDK is often the correct choice. It gives an application the vendor’s native request and response types, endpoint coverage, errors, pagination, streaming helpers, and newly released features without waiting for a framework adapter. Anvia provider packages use those SDKs behind normalized model contracts when portability and shared runtime behavior are more valuable than exposing every vendor surface.

## What direct SDKs do especially well

Official SDKs are the shortest route to a provider’s complete API:

- OpenAI’s [official JavaScript/TypeScript library](https://github.com/openai/openai-node) covers native Responses, streaming, uploads, and the rest of the generated API surface.
- Anthropic’s [official TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) exposes Messages, token counting, streaming helpers, and provider-native types.
- Google’s [`@google/genai` reference](https://googleapis.github.io/js-genai/) covers Gemini Developer API and Vertex AI models, including native content, files, caches, live interactions, and built-in tools.
- Mistral’s [official TypeScript client](https://github.com/mistralai/client-ts) exposes its platform APIs directly.

When a provider ships a new endpoint or an unusual request option, its SDK and API documentation are the authoritative source. A normalized adapter may not expose that capability yet, and some provider concepts have no honest cross-provider equivalent.

## Where the overlap is real

Both direct SDKs and Anvia provider packages can offer:

- typed model requests and responses;
- streaming;
- tool or function calling;
- structured output;
- embeddings and multimodal APIs where the provider supports them;
- custom base URLs, transports, headers, and retries through provider configuration.

Anvia does not replace the underlying service. Its provider adapter maps selected native operations into Anvia’s completion, embedding, image, audio, transcription, OCR, and model-listing contracts.

## The architectural difference

With a direct SDK, application code owns the model loop and provider data structures. Switching providers means rewriting that layer or maintaining an application-defined interface. In return, the code can use every native field and endpoint without translation.

With Anvia, application code targets provider-neutral contracts. The same agent, tool, memory, pipeline, and stream lifecycle can use a model created by [`@anvia/openai`](/packages/openai), [`@anvia/anthropic`](/packages/anthropic), [`@anvia/gemini`](/packages/gemini), [`@anvia/mistral`](/packages/mistral), or [`@anvia/grok`](/packages/grok). Provider-specific `providerOptions` remain available for many model requests, but they do not turn an unsupported endpoint into a supported contract.

Anvia also supplies behavior above a model call: multi-turn agent execution, memory, retrieval, lifecycle callbacks, approvals, pipelines, normalized events, Studio, and observability adapters. A direct SDK intentionally leaves those application/runtime decisions to you.

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

Several Anvia clients accept an already initialized official client:

```ts
import OpenAI from 'openai'
import { OpenAIClient } from '@anvia/openai'

const native = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const anvia = new OpenAIClient({ client: native })

const agentModel = anvia.completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})
const nativeFile = await native.files.create({
  file,
  purpose: 'fine-tune',
})
```

`AnthropicClient`, `GeminiClient`, `MistralClient`, and `GrokClient` likewise accept their documented underlying client objects. This keeps credentials, transport, and connection configuration consistent while preserving native access.

When migrating direct calls into Anvia, start with a request already covered by a provider model contract. Compare normalized content, usage, tool calls, and streaming behavior in tests. Keep unsupported native operations direct instead of hiding them behind an incomplete compatibility wrapper.

## Related Anvia pages

- [Choose a provider](/sdk/providers/choose-a-provider)
- [Provider capability matrix](/sdk/providers/capability-matrix)
- [Packages feature matrix](/packages/feature-matrix)
- [OpenAI package API](/packages/openai/api-reference)
- [Gemini package API](/packages/gemini/api-reference)
