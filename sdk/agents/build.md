# Build an agent

Create an agent after a direct completion confirms that the provider model works.

## Create the agent

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = openai.completionModel('gpt-5')

export const agent = new Agent({
  id: 'support',
  model: model,
  name: 'Support',
  description: 'Answers customer support questions.',
  instructions: 'Answer clearly and ask for any missing details.',
  maxTurns: 4,
})
```

The agent depends on Anvia's completion-model contract, not the OpenAI API. Swap the provider model at the construction boundary without rewriting agent behavior.

## Send the first prompt

```ts
const response = await agent
  .prompt('What information do you need to investigate a failed checkout?')
  .send()

console.log(response.output)
```

`send()` returns the final output, accumulated usage, messages created during the run, and trace metadata when tracing is enabled.

## Keep the identity stable

The `id` option is the stable agent ID. Keep it stable because sessions, traces, evaluations, and
development tooling can use it as an identifier.

`maxTurns: 4` bounds the model-and-tool loop. A smaller request-level limit can override it for one run.
