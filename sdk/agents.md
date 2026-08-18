# Agents

An agent combines a [completion model](/sdk/models/completion) with reusable behavior and a bounded runtime loop. It can call tools, retrieve context, use memory, apply guardrails and middleware, emit lifecycle data, and continue across several model turns.

Use an agent when Anvia should coordinate the workflow rather than make one isolated provider call.

## 1. Define reusable behavior

Create an `Agent` with one explicit options object:

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const model = client.completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})

const supportAgent = new Agent({
  id: 'support',
  name: 'Support assistant',
  model,
  instructions: 'Answer clearly. Use tools before making account-specific claims.',
  maxTurns: 4,
})
```

The model handles provider communication. The agent options define behavior shared by every run.

## 2. Run the agent

`generate()` starts the model-and-tool loop and resolves when the run completes, is blocked, or suspends for an interaction:

```ts
const result = await supportAgent.generate({
    prompt: 'What should I check when a customer cannot reset their password?'
})

if (result.status === 'completed') {
  console.log(result.output)
  console.log(result.usage)
} else if (result.status === 'suspended') {
  console.log(result.interaction)
} else {
  console.log('Blocked at', result.stage)
}
```

A completed result includes the final output, run ID, accumulated token usage, messages created during the run, and optional trace, source, guardrail, and provider-tool metadata.

## 3. Understand the loop

For each run, Anvia can:

1. load session memory;
2. apply input guardrails;
3. retrieve relevant context and tool definitions;
4. send a normalized request to the model;
5. execute requested local tools or suspend for approval or a structured question;
6. add tool results to the transcript and call the model again; and
7. apply output guardrails, save memory, and return the final result.

The application still owns authentication, authorization, services, persistence configuration, deployment, and the response exposed to users. Instructions are not a security boundary; tool handlers and retrieval filters must enforce access.

## Explore agents

- [Build an agent](/sdk/agents/build) creates the first agent and runs it.
- [Stable behavior](/sdk/agents/stable-behavior) separates reusable configuration from request-owned state.
- [Instructions](/sdk/agents/instructions) defines durable model behavior.
- [Context](/sdk/agents/context) covers static documents, retrieval, sessions, and trace metadata.
- [Per-run controls](/sdk/agents/per-run-controls) configures one `generate()` or `stream()` call.
- [Interactions and continuations](/sdk/agents/interactions) handles approvals, questions, and linked resumed phases.
- [Runtime lifecycle](/sdk/agents/runtime-lifecycle) explains turns, tools, memory, and events.
- [Errors and limits](/sdk/agents/errors-and-limits) bounds runs and maps failures safely.

Use a [direct completion](/sdk/completions) when one provider call is the entire workflow and application code already owns every next step.

Continue with [Build an agent](/sdk/agents/build).
