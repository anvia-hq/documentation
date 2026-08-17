# Completions

Use `completionModel(...)` for direct completions, agents, extractors, structured output, and model-driven pipeline stages.

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

const model = openai.completionModel({
    modelId: 'gpt-5.5',
    api: "responses"
})

export const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly and concisely.',
})
```

The returned model implements Anvia's streaming completion contract, so it can back `agent.generate()`, `agent.stream()`, and the direct completion helpers.

## Direct request

Call the model directly when one request is enough and the application owns the surrounding flow:

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Checkout requests timed out for 12 minutes.',
    model,
    instructions: 'Write one concise internal incident summary.',
    maxTokens: 160
})

console.log(result.text)
```

Use an [agent](/sdk/agents) when the run needs tools, memory, dynamic context, lifecycle policy, or multiple turns. Use [parsed completion](/sdk/structured-output/parsed-completion) when one request must return schema-validated data.

## Supported contract features

The default Responses adapter declares streaming, tools, tool choice, image input, file-document input, output schemas, reasoning content, and provider-executed tools. Chat declares streaming, tools, tool choice, image input, output schemas, and reasoning, but not file documents or provider-executed tools.

Support at the adapter level does not guarantee that every OpenAI model ID accepts every feature. Test the exact model and request shape used by the application, especially required tool calls, structured output, documents, and streamed tool arguments.

## Keep provider options local

Provider-specific request values belong at a narrow model-call boundary. Avoid spreading OpenAI-specific fields through agents, domain services, or UI types. That keeps the workflow testable with a fake `CompletionModel` and makes future provider changes explicit.

For adapter selection and capability differences, continue to [Responses and Chat](/sdk/providers/openai/responses-and-chat).
