# Completions

Use `completionModel(...)` for direct completions, agents, extractors, structured output, and model-driven pipeline stages.

```ts
import { AgentBuilder } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = openai.completionModel('gpt-5')

export const supportAgent = new AgentBuilder('support', model)
  .instructions('Answer support questions clearly and concisely.')
  .build()
```

The returned model implements Anvia's streaming completion contract, so the same model can be used for `.send()` and `.stream()` workflows.

## Direct request

Call the model directly when one request is enough and the application owns the surrounding flow:

```ts
import { createCompletion } from '@anvia/core'

const result = await createCompletion(model, {
  instructions: 'Write one concise internal incident summary.',
  input: 'Checkout requests timed out for 12 minutes.',
  maxTokens: 160,
})

console.log(result.text)
```

Use an [agent](/sdk/agents) when the run needs tools, memory, dynamic context, hooks, or multiple turns. Use [parsed completion](/sdk/structured-output/parsed-completion) when one request must return schema-validated data.

## Supported contract features

The default Responses adapter declares support for streaming, tools, tool choice, image input, document input, output schemas, and reasoning content. The Chat adapter supports the same documented features except document input.

Support at the adapter level does not guarantee that every OpenAI model ID accepts every feature. Test the exact model and request shape used by the application, especially required tool calls, structured output, documents, and streamed tool arguments.

## Keep provider options local

Provider-specific request values belong at a narrow model-call boundary. Avoid spreading OpenAI-specific fields through agents, domain services, or UI types. That keeps the workflow testable with a fake `CompletionModel` and makes future provider changes explicit.

For adapter selection and capability differences, continue to [Responses and Chat](/sdk/providers/openai/responses-and-chat).

