# OpenAI

`@anvia/openai` turns OpenAI APIs into Anvia model contracts. Create the provider client once at the server boundary, choose the model capability the workflow needs, and pass that model into agents, completions, retrieval, or media pipelines.

```ts
import { OpenAIClient } from '@anvia/openai'

export const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})
```

## Choose a model

Use `completionModel()` for agents, direct completions, tools, and structured output.

Use `embeddingModel()` for retrieval and semantic search.

Use `decisionModel()` for [typed decisions](/packages/openai/decisions), including classification, scoring, and probability checks.

Use `imageGenerationModel()`, `speechGenerationModel()`, and `transcriptionModel()` for their separate [media contracts](/sdk/providers/openai/media).

Use `listModels()` for administrative [model inventory](/sdk/providers/openai/model-listing).

OpenAI completion models accept `api: 'responses' | 'chat'` on `completionModel({ modelId, api })`. `api` is optional and defaults to `'chat'` (Chat Completions); pass `'responses'` for the Responses API. `baseUrl` changes only the endpoint — it does not select the API. The differences are covered in [Responses and Chat](/sdk/providers/openai/responses-and-chat).

`gpt-6-astra` is in the known model list with context limits and `reasoningEffort` controls restricted to its documented set (`low`, `medium`, `high`, `xhigh`, `max`).

## Continue a conversation across providers

Assistant messages record the provider that generated them. When a session continues on a different provider, adapters replay only history the next API can accept. OpenAI Responses (and Azure, which shares it) omits a `function_call` item ID that is not valid for Responses, such as one from another provider, while `call_id` still links the tool result. Anthropic replays only its own signed thinking and omits assistant turns left empty; Gemini keeps thought signatures only for its own turns.

These rules make a deliberate mid-thread switch safer to attempt, but reasoning and provider-issued hidden state do not transfer. If continuity of hidden reasoning or provider-specific tool state matters, start a new thread or keep the original provider, and test the exact history sequence before relying on it.

## What the provider owns

The package maps Anvia requests, content, tool calls, streams, usage, and media results to and from OpenAI. The application still owns instructions, tool permissions, memory, tenant routing, credential storage, fallback policy, retries, and observability.

Keep those boundaries visible in code. A provider model should be an injected dependency, not the place where product behavior or authorization decisions are hidden.

## Start here

1. [Install and configure the client](/sdk/providers/openai/setup).
2. [Create a completion model](/sdk/providers/openai/completions) for an agent or direct request.
3. Compare [Responses and Chat](/sdk/providers/openai/responses-and-chat).
4. Add only the additional capability models the workflow uses.
5. Review the [production checklist](/sdk/providers/openai/production).
