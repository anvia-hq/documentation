# Model boundary

Keep provider selection at one narrow application boundary. Provider clients create models; models satisfy Anvia capability contracts; workflows receive those models as dependencies.

## Who owns what

| Layer | Owns | Should not own |
| --- | --- | --- |
| Provider client | Credentials, base URL, SDK transport, provider authentication | Prompts, tool policy, memory, product permissions |
| Model object | One runtime capability and its provider request mapping | Route handling, tenant selection, business state |
| Agent or workflow | Instructions, tools, context, limits, hooks, memory, output contract | Provider credentials or SDK setup |
| Application | Model selection, fallback policy, secrets, logging, deployment configuration | Hidden provider switching inside prompts |

The model is the seam between vendor-specific configuration and provider-neutral product behavior.

## Return contracts from factories

Export a Core interface rather than a concrete provider model when the caller does not need provider-specific methods:

```ts
import type { CompletionModel } from '@anvia/core'
import { AnthropicClient } from '@anvia/anthropic'
import { OpenAIClient } from '@anvia/openai'

export type ModelTarget = 'openai' | 'anthropic'

export function createSupportModel(target: ModelTarget): CompletionModel {
  if (target === 'anthropic') {
    const anthropic = new AnthropicClient({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    return anthropic.completionModel('claude-sonnet-4-20250514')
  }

  const openai = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY,
  })

  return openai.completionModel('gpt-5')
}
```

The agent factory can now stay provider-neutral:

```ts
import type { CompletionModel } from '@anvia/core'
import { Agent } from '@anvia/core'

export function createSupportAgent(model: CompletionModel) {
  return new Agent({
    id: 'support',
    model: model,
    instructions: 'Resolve support questions using the available tools.',
    maxTurns: 4,
  })
}
```

Construct long-lived clients once per runtime boundary when the upstream SDK is designed for reuse. Use request-scoped construction only when credentials, tenant routing, or endpoint selection truly changes per request.

## Mix providers deliberately

Provider-neutral does not mean every workflow must use a single provider. Select a model for each job:

```ts
const answerModel = openai.completionModel(process.env.ANSWER_MODEL)
const judgeModel = anthropic.completionModel(process.env.JUDGE_MODEL)
const embeddingModel = gemini.embeddingModel('gemini-embedding-001')
```

This makes a mixed stack explicit. It also lets each capability be benchmarked and replaced independently.

Avoid passing provider clients into tools or constructing them inside prompt handlers. Doing so spreads credentials, retry behavior, and vendor types through the application.

## Inspect completion capabilities

Every completion model declares the contract implemented by its adapter:

```ts
if (!answerModel.capabilities.outputSchema) {
  throw new Error('The configured answer model does not expose output schemas')
}

if (attachments.length > 0 && !answerModel.capabilities.documentInput) {
  throw new Error('The configured answer model does not accept document files')
}
```

The declaration helps reject an unsupported workflow early. It still cannot confirm that a particular upstream model ID or account has the feature enabled, so keep a live smoke test for critical capabilities.

## Treat fallback as product behavior

Anvia models are swappable at the contract boundary, but provider behavior is not automatically identical. A fallback can change tool semantics, schema adherence, media support, reasoning fields, latency, and cost.

Make fallback selection visible in application code. Before enabling it, run the same workflow tests and eval set against every candidate. Do not silently catch every provider error and send the request elsewhere; decide which failures are safe to retry or reroute.

## Keep provider-specific options local

Provider-specific parameters are appropriate when the workflow intentionally depends on them. Keep those parameters beside model selection, document the dependency, and include the exact configuration in smoke tests.

If provider-specific request options begin appearing throughout routes, agents, and tools, the model boundary is leaking. Move them back into the application factory that creates the model or request configuration.

