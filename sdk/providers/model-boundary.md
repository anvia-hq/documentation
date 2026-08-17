# Model boundary

Keep provider selection at one narrow application boundary. Clients create models; models satisfy Anvia capability contracts; workflows receive models as dependencies.

## 1. Assign clear ownership

The provider client owns credentials, base URL, SDK transport, and vendor authentication.

The model object owns one runtime capability and its provider request mapping.

The agent or workflow owns instructions, tools, context, limits, lifecycle, memory, and output behavior.

The application owns selection, fallback policy, secrets, logging, and deployment configuration.

Do not let prompts select credentials or hide provider switching inside model instructions.

## 2. Return Core contracts from factories

```ts
import type { CompletionModel } from '@anvia/core'
import { AnthropicClient } from '@anvia/anthropic'
import { OpenAIClient } from '@anvia/openai'

export type ModelTarget = 'openai' | 'anthropic'

export function createSupportModel(
  target: ModelTarget,
): CompletionModel {
  if (target === 'anthropic') {
    const client = new AnthropicClient({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    return client.completionModel({
        modelId: 'claude-sonnet-4-20250514'
    })
  }

  const client = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  return client.completionModel({
      modelId: 'gpt-5.5',
      api: "responses"
  })
}
```

Callers that need only completion behavior should depend on `CompletionModel`, not a concrete provider class.

## 3. Keep agent factories provider-neutral

```ts
import { Agent, type CompletionModel } from '@anvia/core'

export function createSupportAgent(
  model: CompletionModel,
) {
  return new Agent({
    id: 'support',
    model,
    instructions:
      'Resolve support questions with the available tools.',
    maxTurns: 4,
  })
}
```

Reuse long-lived clients when the upstream SDK supports it. Construct them per request only when credentials, tenant routing, or endpoint selection truly vary.

## 4. Mix providers explicitly

```ts
const answerModel = openai.completionModel({
    modelId: answerModelId
})
const judgeModel = anthropic.completionModel({
    modelId: judgeModelId
})
const embeddingModel = gemini.embeddingModel({
    modelId: 'gemini-embedding-001'
})
```

Each capability can then be benchmarked, traced, and replaced independently. Avoid constructing provider clients inside tool handlers or prompt-processing functions.

## 5. Inspect completion declarations

```ts
if (!answerModel.capabilities.outputSchema) {
  throw new Error(
    'The configured answer model does not expose output schemas.',
  )
}

if (
  attachments.length > 0 &&
  !answerModel.capabilities.documentInput
) {
  throw new Error(
    'The configured model does not accept document files.',
  )
}
```

This catches adapter-level mismatches early. It is not a network probe for the selected upstream model, account, or region.

## 6. Treat fallback as product behavior

Fallback may change tool semantics, schema adherence, media support, reasoning fields, latency, and cost. Make it explicit in application code and test every fallback against the same workflow and eval set.

Keep provider-specific request options beside the model factory. When vendor parameters spread through routes, agents, and tools, move them back to this boundary.

Next, [choose a provider](/sdk/providers/choose-a-provider).
