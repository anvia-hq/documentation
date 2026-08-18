# Responses and Chat

`OpenAIClient` can create completion models backed by OpenAI's Responses API or Chat Completions API. The selection belongs to the model factory, not the client, and is always explicit.

## Select the API per model

```ts
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

const responsesModel = openai.completionModel({
  modelId: 'gpt-5.6-sol',
  api: 'responses',
})

const chatModel = openai.completionModel({
  modelId: 'gpt-5.6-sol',
  api: 'chat',
})
```

One client can create both model handles. A custom `baseUrl` changes where requests go; it does not choose the API.

## Capability differences

Both adapters declare streaming, local tools, tool choice, image input, output schemas, and reasoning. Responses additionally declares file-document input and provider-executed tools. Chat declares neither.

These are adapter capabilities, not a promise for every model or compatible endpoint. Check the selected model's capabilities and run live tests for the exact account, endpoint, and model ID.

## Which should you use?

Use `api: 'responses'` for native OpenAI workflows unless an existing integration requires Chat. Responses is also the documented path for document input and provider tools. Use `api: 'chat'` for an endpoint that implements only Chat Completions or for an already-tested Chat workflow.

Do not switch APIs silently as a fallback. The endpoints differ in request validation, tool behavior, stream events, and content support. Treat `{ baseUrl, api, modelId }` as deployment configuration and record it in startup diagnostics or traces.

## Failure behavior

Both adapters normalize non-streaming output and streaming events into Anvia contracts. Provider and network failures still reject or surface through the stream. A Responses `response.failed` event includes normalized usage when OpenAI supplies it; failures without provider usage cannot report it.
