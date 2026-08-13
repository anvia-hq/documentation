# Your first agent

Turn a provider model into a reusable agent with a clear identity, instructions, and a bounded model loop.

## Before you start

Complete [Install and setup](/sdk/install-and-setup) first. You should already have `@anvia/core`, a provider package, and a working API key.

## Construct the agent

Create the provider model, then pass it in the `Agent` options.

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = client.completionModel('gpt-5')

const agent = new Agent({
  id: 'support',
  model: model,
  instructions: 'Answer support questions clearly and ask for missing details.',
  maxTurns: 4,
})
```

The agent setup has four parts:

| Part | Purpose |
| --- | --- |
| `id: 'support'` | Gives the agent a stable identity. |
| `model` | Supplies the provider-backed completion model. |
| `instructions` | Defines the agent's reusable behavior. |
| `maxTurns: 4` | Bounds the model and tool loop for each run. |

## Send a prompt

Create a run with `prompt()`, then execute it with `send()`.

```ts
const response = await agent
  .prompt('What information do you need to investigate a failed checkout?')
  .send()

console.log(response.output)
```

The exact response can vary, but it should follow the support instructions and ask for any details it needs.

## Agent or direct completion?

| Use a direct completion when | Use an agent when |
| --- | --- |
| The task is a single model call. | Behavior should be reusable across requests. |
| Your application owns all orchestration. | The task needs instructions, tools, memory, or multiple turns. |

Your agent is now ready for capabilities such as [tools](/sdk/tools), [memory](/sdk/memory), and
[streaming](/sdk/streaming).
