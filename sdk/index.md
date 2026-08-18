# Anvia SDK

The Anvia SDK is a set of TypeScript runtime primitives for model calls, agents, tools, structured data, retrieval, workflows, application transports, and observability.

Anvia owns the model-facing runtime. Your application continues to own credentials, authentication, permissions, product data, persistence, side effects, deployment, and the response shown to users.

## Start with the smallest runtime shape

Choose the primitive that matches the work instead of starting every feature with an agent.

### Use a completion for one model call

A completion is appropriate when application code already knows the exact input and owns the entire flow.

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Summarize this support ticket in one paragraph.',
    model,
    instructions: 'Keep the summary factual and concise.'
})

console.log(result.text)
```

`generateCompletion()` normalizes the request, response, content, and token usage. It does not run tools or persist conversation memory.

### Use an agent for reusable behavior

An agent is appropriate when instructions should be reused or the task may need tools, memory, context, approvals, guardrails, or multiple model turns.

```ts
import { Agent } from '@anvia/core'

const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly. Ask for missing details.',
  maxTurns: 4,
})

const response = await supportAgent.generate({
    prompt: 'What should I check when a password reset email does not arrive?'
})
```

In the v1 API, agents are constructed directly and runs start with `generate()` or `stream()`.

## Add capabilities as the product grows

The SDK is organized around explicit dependencies:

- [Models](/sdk/models) connect provider packages to the provider-neutral runtime.
- [Completions](/sdk/completions) perform direct model calls.
- [Agents](/sdk/agents) coordinate reusable behavior and model/tool turns.
- [Tools](/sdk/tools) expose typed application-owned actions.
- [Memory](/sdk/memory) loads and appends durable session messages.
- [Knowledges](/sdk/knowledges) attach documents and retrieval indexes.
- [Structured output](/sdk/structured-output) turns model responses into validated data.
- [Pipelines](/sdk/pipelines) compose repeatable sequential and parallel workflows.
- [Streaming](/sdk/streaming) exposes normalized runtime events.
- [Server](/packages/server) and [React](/packages/react) connect the runtime to product interfaces.
- [Observability](/use-cases/observe-systems) records runs, generations, tools, usage, and traces.

These capabilities extend the same runtime objects. Adding memory to an agent or observability to a pipeline does not require moving the feature into a different framework.

## Install the v1 release candidate

Install the core runtime and one provider package from the same release channel:

```bash
pnpm add @anvia/core@rc @anvia/openai@rc
```

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}

const client = new OpenAIClient({ apiKey })

const agent = new Agent({
  id: 'assistant',
  model: client.completionModel({
      modelId: 'gpt-5.6-sol',
      api: "responses"
  }),
  instructions: 'Answer clearly and concisely.',
})

const response = await agent.generate({
    prompt: 'Explain Anvia in one sentence.'
})

if (response.status === 'completed') {
  console.log(response.output)
}
```

Provider clients receive configuration explicitly. They do not load environment variables on their own.

## Learn in order

1. [Install and setup](/sdk/install-and-setup) verifies the provider connection with a direct completion.
2. [Your first agent](/sdk/your-first-agent) adds reusable instructions and bounded execution.
3. [Tools](/sdk/tools) connects the model to application-owned reads and actions.
4. [Memory](/sdk/memory) adds durable conversation identity.
5. [Build applications](/use-cases/build-applications) exposes runtime events from a server.

For a complete package map, continue to the [Package catalog](/packages/catalog).
