# Your first agent

Turn a provider model into a reusable agent with a clear identity, instructions, and a bounded model loop.

## Before you start

Complete [Install and setup](/sdk/install-and-setup) first. You should already have `@anvia/core`, a provider package, and a working API key.

## Build the agent

Create the provider model, then pass it to `AgentBuilder`.

```ts
import { AgentBuilder } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = client.completionModel('gpt-5')

const agent = new AgentBuilder('support', model)
  .instructions('Answer support questions clearly and ask for missing details.')
  .defaultMaxTurns(4)
  .build()
```

The agent setup has four parts:

| Part | Purpose |
| --- | --- |
| `support` | Gives the agent a stable identity. |
| `model` | Supplies the provider-backed completion model. |
| `instructions(...)` | Defines the agent's reusable behavior. |
| `defaultMaxTurns(4)` | Bounds the model and tool loop for each run. |

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
