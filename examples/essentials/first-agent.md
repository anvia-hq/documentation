# First agent

An agent combines a completion model with stable identity and behavior. Use it when instructions or runtime features should be configured once and reused across requests.

## 1. Create the agent

Use the setup from [Text completion](./basic-completion), then save this as `first-agent.ts`:

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error('Set OPENAI_API_KEY.')

const model = new OpenAIClient({ apiKey }).completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' })

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

const releaseNotes = 'Added streaming support and changed the retry defaults.'

const result = await reviewer.generate({ prompt: releaseNotes })

if (result.type === 'interaction') {
  throw new Error(`Agent requested ${result.interaction.type}`)
}
if (result.type === 'blocked') throw new Error(`Agent blocked at ${result.stage}: ${result.reason}`)

console.log(result.output)
```

## 2. Run it

```sh
pnpm tsx first-agent.ts
```

`Agent` snapshots stable configuration. `generate(options)` takes one object with the input (`prompt` or `messages`) and optional per-run settings such as `maxTurns` or `abortSignal`, then runs a fresh execution. Its result `type` is `response` with the final `output`, `blocked` by a guardrail, or `interaction` with a JSON-safe approval or question request and a `continuation`.

## Stream the same agent

Add this to the same file to stream instead of waiting for the whole answer:

```ts
for await (const event of reviewer.stream({ prompt: releaseNotes })) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'error') throw event.error
}
```

The stream ends with the same `response`, `blocked`, or `interaction` outcome as `generate(...)`, or with an `error` event.

Instructions guide the model but do not enforce truth, authorization, or output safety. Put facts and side effects behind authorized tools, validate important outputs, and keep secrets out of prompts.

Continue with [Agent with tools](./agent-with-tools) or [Conversation memory](./conversation-memory).
