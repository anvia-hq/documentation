# First agent

**Type:** Recipe

## Outcome

Create a reusable agent with a stable identity and instructions, then run one request. Use an agent
when behavior should be configured once and reused across prompts; use a direct completion for an
isolated model call with no agent lifecycle.

## Prerequisites

- Node.js 22 or newer and pnpm
- `@anvia/core`, `@anvia/openai`, and `tsx`
- A server-side `OPENAI_API_KEY`

## Implementation

Save as `first-agent.ts`:

```ts
import { Agent } from '@anvia/core/agent'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error('Set OPENAI_API_KEY.')

const model = new OpenAIClient({ apiKey }).completionModel('gpt-5')

const reviewer = new Agent({
  id: 'release-reviewer',
  model: model,
  name: 'Release reviewer',
  description: 'Reviews release notes for clarity and missing operational detail.',
  instructions: [
    'Review only the text supplied by the user.',
    'Identify unclear claims and missing upgrade steps.',
    'Return no more than five bullets.',
  ].join('\n'),
})

const response = await reviewer
  .prompt('Added streaming support and changed the retry defaults.')
  .send()

console.log(response.output)
```

## Run and expected behavior

```bash
pnpm tsx first-agent.ts
```

The agent returns a short review. `Agent` stores stable configuration; `prompt(...)` creates a
single-use request where per-run controls such as maximum turns, retries, hooks, middleware, and
tracing can be added before `send()` or `stream()`.

## Boundaries

Instructions guide a model but do not enforce authorization, truthfulness, or output safety. Keep
secrets out of prompts, validate important outputs, and use tools or application code for facts and
side effects. A production service should reuse configured agents, but create a new prompt request
for every run and isolate tenant-specific context.

## Source and extensions

The runnable baseline is the
[text-call cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/01_basics/01-text-call.ts).
Next, add [conversation memory](./conversation-memory), [tools](./agent-with-tools), or structured
agent output.

- [Build agents](/sdk/agents/build)
- [Runtime lifecycle](/sdk/agents/runtime-lifecycle)
