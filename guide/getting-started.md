# Getting started

This quickstart verifies a provider model, wraps it in an agent, and runs one prompt. You need an ESM-compatible TypeScript project, `pnpm`, and an OpenAI API key.

## Install the runtime

```bash
pnpm add @anvia/core @anvia/openai
```

Set your provider credentials in the environment:

```bash
export OPENAI_API_KEY=...
```

## Verify the model

Call the model directly before adding agent behavior. This isolates credentials and provider setup from the rest of the runtime.

```ts
import { createCompletion } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = client.completionModel('gpt-5')

const result = await createCompletion(model, {
  instructions: 'Answer clearly and concisely.',
  input: 'Summarize Anvia in one sentence.',
})

console.log(result.text)
```

`createCompletion` returns visible `text`, normalized `content`, token `usage`, and the full normalized `response`. It does not run tools, save memory, or loop through agent turns.

## Build an agent

Once the provider works, wrap the model in reusable runtime behavior:

```ts
import { AgentBuilder } from '@anvia/core'

const agent = new AgentBuilder('support', model)
  .instructions('Answer support questions clearly and ask for missing details.')
  .defaultMaxTurns(4)
  .build()
```

The agent depends on the provider-neutral model interface. Changing providers does not require moving provider-specific code into the agent.

## Send a prompt

```ts
const response = await agent
  .prompt('Explain what the Anvia runtime owns.')
  .send()

console.log(response.output)
```

The response includes the final `output`, accumulated `usage`, run `messages`, and trace metadata when tracing is enabled.

## Stream a response

Use the same prompt with `stream()` when a UI or CLI should update while the run is active:

```ts
for await (const event of agent.prompt('Draft a short launch note.').stream()) {
  if (event.type === 'text_delta') process.stdout.write(event.delta)
  if (event.type === 'final') console.log(event.usage)
}
```

Agent streams include text, reasoning, tool calls, tool results, turn boundaries, final run metadata, and errors.

## Next

Continue with [Core concepts](/guide/core-concepts), then [Build applications](/use-cases/build-applications) when you are ready to expose the agent from a server.
