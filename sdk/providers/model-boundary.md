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
        modelId: 'claude-sonnet-5'
    })
  }

  const client = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  return client.completionModel({
      modelId: 'gpt-5.6-sol',
      api: "responses"
  })
}
```

Callers that need only completion behavior should depend on `CompletionModel`, not a concrete provider class.

The factories also accept `contextLimits`, an explicit `{ contextWindow, maxInputTokens, maxOutputTokens }` override resolved against each provider's built-in per-model limits table. The OpenAI, Anthropic, Gemini, and Grok factories also accept `controls`, which replaces the model-derived controls.

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
    modelId: answerModelId,
    api: 'responses'
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

## 7. Declare controls in a custom model

`defineCompletionModelControls` validates select controls and returns a frozen snapshot while
preserving literal option types. A custom adapter must map these values into its own provider
request. This complete offline model uses the same boundary without a provider SDK:

```ts anvia-check custom-model-example
import {
  Usage, defineCompletionModelControls, generateCompletion, resolveModelContextLimits, withContextUsage,
} from '@anvia/core'
import {
  assertCompletionRequestSupported, mergeCompletionControlValues,
  type CompletionControlValues, type CompletionModel,
} from '@anvia/core/completion'

const controls = defineCompletionModelControls({
  responseStyle: { type: 'select', label: 'Response style',
    options: ['brief', 'detailed'], defaultValue: 'brief' },
})
const defaults: CompletionControlValues<typeof controls> = { responseStyle: controls.responseStyle.defaultValue }
const limits = resolveModelContextLimits('offline', {}, { contextWindow: 1000, maxOutputTokens: 200 })
const model: CompletionModel<{ verbosity: string }, typeof controls> = {
  provider: 'demo', modelId: 'offline', controls, contextLimits: limits,
  capabilities: { streaming: false, tools: false, toolChoice: false, outputSchema: false,
    imageInput: false, documentInput: false, reasoning: false },
  async completion(request, options) {
    options?.abortSignal?.throwIfAborted()
    assertCompletionRequestSupported(model, request)
    const values = mergeCompletionControlValues(defaults, request.controls)
    // Map the accepted Anvia value to the provider's parameter vocabulary.
    const providerRequest = { verbosity: values?.responseStyle === 'detailed' ? 'long' : 'short' }
    const response = {
      choice: [{ type: 'text' as const, text: providerRequest.verbosity }],
      usage: { ...Usage.empty(), inputTokens: 20, outputTokens: 5, totalTokens: 25 },
      rawResponse: providerRequest,
    }
    return withContextUsage(response, limits === undefined ? undefined : { modelId: model.modelId, context: limits })
  },
}
const result = await generateCompletion({ model, prompt: 'Explain', controls: { responseStyle: 'detailed' } })
console.log(result.output, result.contextUsage?.usedPercent) // long, 2
```

Control declarations require nonblank IDs/labels, nonempty unique string options, and a default
among those options. `CompletionControlValues<typeof controls>` restricts values at compile time.
A `defaultValue` is metadata: a custom adapter applies it explicitly, as above.
`mergeCompletionControlValues(defaults, overrides)` lets string overrides win and returns a frozen
record, or undefined if no values remain. It does not validate option membership.

The high-level runtime validates request capabilities and declared control values before calling
the model. `assertCompletionRequestSupported(model, request, { streaming? })` repeats that check
for direct model callers; `assertCompletionControlsSupported(model, values)` checks only controls.
Both throw `CompletionCapabilityError`. Neither validates arbitrary `providerOptions` or proves
that an upstream account supports the selected feature.

`REASONING_EFFORT_CONTROL_ID` is the exported string `reasoningEffort`; use it when declaring that
standard control. Its allowed options still belong to the model. The factory, reasoning ID, and
context helpers are exported from both the root and `@anvia/core/completion`; the merge and support
assertions are exported from the completion subpath.

## 8. Attach context usage explicitly

`resolveModelContextLimits(modelId, catalog, override?)` returns the override when supplied,
otherwise the exact catalog entry; an unknown model without an override returns undefined. It
selects metadata rather than probing the provider or validating limits.

`calculateContextUsage(usage, modelInfo)` uses `usage.inputTokens` and `modelInfo.context.contextWindow`.
It returns undefined when model metadata is absent, input tokens are nonfinite/nonpositive, or the
window is nonfinite/nonpositive. Remaining tokens floor at zero and used percent caps at 100; the
reported used token count is not capped. `maxInputTokens` and `maxOutputTokens` do not change this
window calculation. `withContextUsage(response, modelInfo)` attaches that snapshot, or returns the
response unchanged when no snapshot can be computed.

Keep missing usage as unknown rather than inventing a percentage. Context accounting does not
enforce a token budget, reserve output capacity, or replace memory compaction estimates. Pass
accurate provider usage and maintain a separate request-budget policy where needed.
