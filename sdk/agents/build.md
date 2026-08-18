# Build an agent

Build an agent after a [direct completion](/sdk/completions/create) confirms that the provider credential, endpoint, and model are working.

## 1. Create the provider model

Keep the credential in server-side configuration and validate it when the application starts:

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

The agent depends on Anvia's provider-neutral completion-model contract. Changing providers later means supplying a different model at this boundary, not rewriting the agent loop.

## 2. Construct the agent

```ts
import { Agent } from '@anvia/core'

export const supportAgent = new Agent({
  id: 'support',
  name: 'Support assistant',
  description: 'Helps investigate customer support requests.',
  model,
  instructions: [
    'Answer support questions clearly.',
    'Ask for details when the report is incomplete.',
    'Do not invent account-specific information.',
  ].join('\n'),
  maxTurns: 4,
})
```

`id` is the stable runtime identity used by sessions, traces, evaluations, development tooling, and agent-as-tool integrations. Keep it predictable and do not derive it from a user prompt.

`name` and `description` are optional human-readable metadata. `maxTurns` bounds the model-and-tool loop; when omitted, the runtime default is 20.

## 3. Generate the first response

```ts
const result = await supportAgent.generate({
    prompt: 'A customer cannot reset their password. What should I verify first?'
})

if (result.status === 'suspended') throw new Error(`Interaction required: ${result.interaction.type}`)
if (result.status === 'blocked') throw new Error(`Blocked at ${result.stage}`)

console.log(result.output)
console.log(result.runId)
console.log(result.usage.totalTokens)
```

The status checks remain important as capabilities are added. `generate()` can return a `suspended` result when a configured tool needs approval or a structured human answer.

## 4. Stream the same agent

Use `stream()` when an interface should update while the run is active:

```ts
for await (const event of supportAgent.stream({
    prompt: 'Draft a short password-reset troubleshooting reply.'
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    process.stdout.write('\n')
    console.log(event.result.runId, event.result.usage)
  }

  if (event.type === 'final' && event.result.status === 'suspended') {
    console.log('Interaction required:', event.result.interaction)
  }
}
```

The model must support streaming. Anvia emits normalized runtime events instead of exposing one provider's wire format.

## 5. Add capabilities deliberately

Start with the smallest agent that works. Add [tools](/sdk/tools), [context](/sdk/agents/context), [memory](/sdk/memory), guardrails, or observers when the product actually needs those boundaries.

Continue with [Stable behavior](/sdk/agents/stable-behavior).
