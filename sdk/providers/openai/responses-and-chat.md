# Responses and Chat

`OpenAIClient` can back completion models with either OpenAI's Responses API or Chat Completions API.

## Default behavior

With an OpenAI API key and no custom `baseUrl`, `completionModel(...)` uses the Responses adapter:

```ts
const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = openai.completionModel('gpt-5')
```

With a custom `baseUrl`, the client defaults to the Chat adapter because that is the more common compatibility surface.

## Select explicitly

Set `completionApi` when deployment behavior should not depend on the other client options:

```ts
const responsesClient = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
  completionApi: 'responses',
})

const chatClient = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
  completionApi: 'chat',
})
```

| Capability declared by the adapter | Responses | Chat |
| --- | --- | --- |
| Streaming | Yes | Yes |
| Tools and tool choice | Yes | Yes |
| Image input | Yes | Yes |
| Document input | Yes | No |
| Output schemas | Yes | Yes |
| Reasoning content or fields | Yes | Yes |

These are Anvia adapter capabilities, not a promise for every model or compatible endpoint.

## Which should you use?

Use Responses for OpenAI unless an existing integration requires Chat. Responses is also the documented path when the workflow sends document content. Use Chat for a target that implements only Chat Completions or when maintaining an already-tested Chat workflow.

Do not switch adapters silently as a fallback. The two endpoints can differ in request validation, tool behavior, stream events, and content support. Make the selected adapter part of deployment configuration and include it in traces or startup diagnostics.

## Failure behavior

Both adapters normalize non-streaming output and streaming events into Anvia contracts. Provider and network failures still reject or surface through the stream. A Responses `response.failed` event includes normalized usage when OpenAI supplies usage for that failed response; failures without provider usage cannot report it.

Handle errors at the application boundary and avoid exposing raw provider messages to end users.

