# First agent

An agent combines a completion model with stable identity and behavior. Use it when instructions or runtime features should be configured once and reused across requests.

## 1. Create the agent

Save this as `first-agent.ts`:

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error('Set OPENAI_API_KEY.')

const model = new OpenAIClient({ apiKey })
    .completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})

const reviewer = new Agent({
  id: 'release-reviewer',
  model,
  name: 'Release reviewer',
  description: 'Reviews release notes for clarity and operational gaps.',
  instructions: [
    'Review only the text supplied by the user.',
    'Identify unclear claims and missing upgrade steps.',
    'Return no more than five bullets.',
  ].join('\n'),
})

const result = await reviewer.generate({
    prompt: 'Added streaming support and changed the retry defaults.'
})

if (result.status === 'suspended') {
  throw new Error(`Agent suspended for ${result.interaction.type}`)
}
if (result.status === 'blocked') throw new Error(`Agent blocked at ${result.stage}`)

console.log(result.output)
```

## 2. Run it

```sh
pnpm tsx first-agent.ts
```

`Agent` snapshots stable configuration. `generate(input, options?)` creates and runs a fresh execution. Its result is `completed`, `blocked` by a guardrail, or `suspended` with a JSON-safe approval or question interaction.

## Stream the same agent

```ts
for await (const event of reviewer.stream({
    prompt: releaseNotes
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }
}
```

Instructions guide the model but do not enforce truth, authorization, or output safety. Put facts and side effects behind authorized tools, validate important outputs, and keep secrets out of prompts.

Continue with [Agent with tools](./agent-with-tools) or [Conversation memory](./conversation-memory).
