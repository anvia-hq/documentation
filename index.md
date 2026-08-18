# Build your first Anvia agent

Anvia is a TypeScript runtime for adding AI agents to an application without handing over the rest of its architecture. You create the provider model and define the agent's behavior; Anvia runs the model and tool loop.

The tutorial below builds a small support agent with the v1 release-candidate API. Add each snippet to the same TypeScript file in order.

## 1. Install the runtime and a provider

`@anvia/core` contains the provider-neutral agent runtime. `@anvia/openai` adapts OpenAI and OpenAI-compatible models to that runtime. During the release-candidate period, use the `rc` tag so both packages stay on the v1 release train.

```bash
pnpm add @anvia/core@rc @anvia/openai@rc
```

Keep credentials in your application's configuration. Anvia clients receive credentials explicitly and do not read environment variables on their own.

```bash
export OPENAI_API_KEY=...
```

## 2. Create a provider model

The provider client handles the provider-specific API. Calling `completionModel()` creates the model object that the rest of Anvia depends on.

```ts
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}

const client = new OpenAIClient({ apiKey })
const model = client.completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})
```

This separation is what keeps the agent provider-neutral. To change providers later, create a different model and leave the agent behavior unchanged.

## 3. Define the agent

An agent combines a model with reusable behavior. Its ID is useful for tracing and memory, while its instructions and turn limit define how it should handle a run.

```ts
import { Agent } from '@anvia/core'

const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly. Ask for missing details.',
  maxTurns: 4,
})
```

The dependencies remain visible at construction time. Tools, memory, context, guardrails, and observers can be added to the same options object as the application grows.

## 4. Generate an answer

`generate()` starts the agent loop and resolves when the run completes, is blocked, or suspends for an approval or question. Checking the status keeps that boundary explicit, even though this first agent has no tools yet.

```ts
const response = await supportAgent.generate({
    prompt: 'A customer cannot reset their password. What should I check first?'
})

if (response.status === 'suspended') throw new Error(`Interaction required: ${response.interaction.type}`)
if (response.status === 'blocked') throw new Error(`Blocked at ${response.stage}`)

console.log(response.output)
```

The completed result includes the final output, normalized messages, token usage, and run metadata. Your application decides how that result is stored or presented to a user.

## Stream the same agent

Use `stream()` when a CLI or interface should update while the model is responding. It emits normalized events, so application code does not need to translate each provider's streaming format.

```ts
for await (const event of supportAgent.stream({
    prompt: 'Draft a short support reply.'
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    process.stdout.write('\n')
    console.log(event.result.usage)
  }
}
```

## What changed from v0

The v0 API builds agents through `AgentBuilder` and sends work through `prompt().send()`. In v1, construction uses one explicit options object and execution happens directly on the agent.

In v0, the builder accumulates configuration before creating the agent:

```ts
const supportAgent = new AgentBuilder('support', model)
  .instructions('Answer support questions clearly.')
  .defaultMaxTurns(4)
  .build()

const response = await supportAgent.prompt(input).send()
```

In the v1 release candidate, the constructor receives that configuration directly and `generate()` starts the run:

```ts
const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly.',
  maxTurns: 4,
})

const response = await supportAgent.generate({
    prompt: input
})
```

The runtime boundary stays the same: Anvia owns the model and tool loop, while the application owns credentials, authentication, permissions, data access, persistence, deployment, and user-facing responses.

## Continue building

- Follow [Getting started](/guide/getting-started) for direct completions and a deeper walkthrough.
- Learn how agents, tools, context, memory, and events fit together in [Core concepts](/guide/core-concepts).
- Add application-owned actions in [Tools](/sdk/tools).
- Connect an agent to a server or interface in [Build applications](/use-cases/build-applications).
- Review production boundaries in [Production operations](/use-cases/production).
