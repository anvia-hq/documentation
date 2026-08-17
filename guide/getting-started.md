# Getting started

This tutorial verifies a provider model, wraps it in reusable agent behavior, and runs both a complete and streaming response. You need an ESM-compatible TypeScript project, `pnpm`, and an OpenAI API key.

## 1. Install the release candidate

Install the provider-neutral runtime and the OpenAI adapter from the same release channel. The `rc` tag prevents a v0 stable package from being mixed with the v1 API shown here.

```bash
pnpm add @anvia/core@rc @anvia/openai@rc
```

Keep the provider credential in your application's environment:

```bash
export OPENAI_API_KEY=...
```

## 2. Create the model

Provider clients are explicit dependencies. They receive credentials from your configuration layer and create models that satisfy Anvia's provider-neutral completion contract.

```ts
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}

const client = new OpenAIClient({ apiKey })
const model = client.completionModel({
    modelId: 'gpt-5.5',
    api: "responses"
})
```

Changing providers later only changes this construction step. The agent can continue depending on the same model interface.

## 3. Verify one completion

Call the model directly before adding agent behavior. This isolates credentials, model access, and provider configuration from the model/tool loop.

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Summarize Anvia in one sentence.',
    model,
    instructions: 'Answer clearly and concisely.'
})

console.log(result.text)
```

`generateCompletion()` makes one provider call. It returns typed `output`, visible `text`, normalized `content`, token `usage`, and `rawResponse`; it does not run tools or save memory.

## 4. Define reusable agent behavior

An agent keeps instructions, limits, tools, context, and other runtime dependencies together. In v1, that configuration goes directly into the constructor.

```ts
import { Agent } from '@anvia/core'

const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly. Ask for missing details.',
  maxTurns: 4,
})
```

`maxTurns` limits the number of model turns in a run. Tool-assisted agents often need more than one turn because the model must request a tool, receive its result, and then answer.

## 5. Generate an answer

`generate()` runs the agent until it completes or pauses for tool approval. The result status makes that boundary explicit.

```ts
const response = await supportAgent.generate({
    prompt: 'Explain what the Anvia runtime owns.'
})

if (response.status === 'approval_required') {
  throw new Error(`Approval required for ${response.approval.toolName}`)
}

console.log(response.output)
console.log(response.usage)
```

A completed response also contains normalized messages, a run ID, context usage when available, and trace metadata when tracing is enabled.

## 6. Stream the same agent

Use `stream()` when a terminal or interface should update while the run is active. It yields provider-neutral events rather than provider-specific stream chunks.

```ts
for await (const event of supportAgent.stream({
    prompt: 'Draft a short launch note.'
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

Agent streams can also include reasoning deltas, tool calls, tool results, turn boundaries, approval requests, final run metadata, and errors.

## Next

Continue with [Core concepts](/guide/core-concepts) to understand the runtime pieces, then [Build applications](/use-cases/build-applications) when you are ready to expose the agent from a server.
