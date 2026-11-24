# Agent runtime

An `Agent` runs a bounded model-and-tool loop around one completion model. Each run returns one explicit outcome — a response, an interaction, or a guardrail block — so your application always knows what to do next.

## When to use it

- The model should decide when to call tools and continue across several turns.
- Several requests share the same instructions, tools, memory, and policies.
- A run may need to pause for human approval or a structured question before continuing.
- Input or output must pass guardrail policies before it reaches the model or the user.
- One provider call is not the whole workflow. If it is, use a [direct completion](/sdk/completions).

## How it works

Constructor options define stable behavior. `generate()` runs the loop and resolves to an outcome; `stream()` runs the same loop and yields normalized events such as `text_delta`, `tool_call`, and `tool_result` before the terminal event.

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const model = client.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' })

const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer clearly. Use tools before making account-specific claims.',
  maxTurns: 4,
})

const result = await supportAgent.generate({
  prompt: 'What should I check when a customer cannot reset their password?',
})

if (result.type === 'response') console.log(result.output)
else if (result.type === 'interaction') console.log(result.interaction.type)
else console.log('Blocked at', result.stage, result.reason)
```

Every outcome carries `text`, a run ID, accumulated token usage, and the messages created during the run. An `interaction` is expected control flow: keep its `continuation` on the server and call `agent.resume(continuation, response)` with the approval or answers.

`maxTurns` bounds the loop. Run options such as `maxTurns`, `retries`, `controls`, `abortSignal`, `toolConcurrency`, `guardrails`, `middlewares`, `lifecycle`, and `trace` override or extend the constructor for one call.

Guardrail policies allow, block, or rewrite model-facing input and output; an enforced block returns `type: 'blocked'` rather than throwing. Lifecycle callbacks observe start, tool, finish, and error events without changing execution.

## What your application owns

- Authentication and authorization. Instructions are not a security boundary; tool handlers and retrieval filters must enforce access.
- Storing continuations server-side, claiming each interaction once, and expiring stale responses.
- Choosing which stream events reach a browser. Do not forward raw reasoning, tool arguments, or tool results without a data policy.
- Provider credentials, retry budgets, cancellation, and deployment.
- Idempotency for side effects. Cancelling a run cannot undo a tool call that already completed.

## Go deeper

- [Your first agent](/sdk/your-first-agent): install, configure a model, and run an agent end to end.
- [Agents](/sdk/agents): the runtime loop and the full agents section.
- [Per-run controls](/sdk/agents/per-run-controls): options for one `generate()` or `stream()` call.
- [Interactions and continuations](/sdk/agents/interactions): approvals, questions, and resumed runs.
- [Errors and limits](/sdk/agents/errors-and-limits): bound runs and map failures safely.
- [Streaming](/sdk/streaming): agent stream events, cancellation, and server transport.
- [Guardrails](/sdk/guardrails): input and output policies, observe and enforce modes.
- [Lifecycle and run control](/sdk/advanced/hooks): lifecycle callbacks, approval, and middleware.
