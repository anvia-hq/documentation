# Switch providers

**Type:** Pattern

## Outcome

Select a provider-backed completion model at the application boundary while keeping agent behavior
provider-neutral. Use this for controlled environment routing, migration tests, or deliberate model
experiments—not unbounded fallback after a side effect.

## Prerequisites

- `pnpm add @anvia/core @anvia/openai @anvia/anthropic @anvia/gemini @anvia/grok @anvia/mistral`
- Credentials only for providers enabled by deployment configuration
- A live contract suite for every selected model

## Model factory and agent

```ts
import { AnthropicClient } from '@anvia/anthropic'
import { Agent } from '@anvia/core/agent'
import type { StreamingCompletionModel } from '@anvia/core/completion'
import { GeminiClient } from '@anvia/gemini'
import { GrokClient } from '@anvia/grok'
import { MistralClient } from '@anvia/mistral'
import { OpenAIClient } from '@anvia/openai'

function completionModel(provider: string): StreamingCompletionModel {
  if (provider === 'anthropic') {
    return new AnthropicClient({ apiKey: process.env.ANTHROPIC_API_KEY! })
        .completionModel({
        modelId: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5'
    })
  }
  if (provider === 'gemini') {
    return new GeminiClient({ apiKey: process.env.GEMINI_API_KEY! })
        .completionModel({
        modelId: process.env.GEMINI_MODEL ?? 'gemini-3.6-flash'
    })
  }
  if (provider === 'grok') {
    return new GrokClient({ apiKey: process.env.XAI_API_KEY! })
        .completionModel({
        modelId: process.env.GROK_MODEL ?? 'grok-4.5',
        api: 'responses'
    })
  }
  if (provider === 'mistral') {
    return new MistralClient({ apiKey: process.env.MISTRAL_API_KEY! })
        .completionModel({
        modelId: process.env.MISTRAL_MODEL ?? 'mistral-large-latest'
    })
  }
  if (provider === 'openai') {
    return new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
        .completionModel({
        modelId: process.env.OPENAI_MODEL ?? 'gpt-5.6-luna',
        api: "responses"
    })
  }
  throw new Error(`Unsupported provider: ${provider}`)
}

const model = completionModel(process.env.ANVIA_PROVIDER ?? 'openai')
const agent = new Agent({
  id: 'assistant',
  model: model,
  instructions: 'Answer in two sentences or less.',
})

const result = await agent.generate({
    prompt: 'What is a model boundary?'
})

if (result.status === 'completed') {
  console.log(result.output)
}
```

## Run and expected behavior

Set `ANVIA_PROVIDER` and its matching key, then run the file with `pnpm tsx`. The same agent code
uses the selected adapter. Model IDs are examples from the current cookbook; confirm availability
for your account.

## Boundaries

Provider-neutral contracts do not imply identical quality or capabilities. Tools, schemas,
reasoning, media, context limits, safety controls, usage, and errors vary. Do not accept provider or
model names directly from an untrusted user. If retrying through another provider, do so only before
non-idempotent work and record which model produced each result.

In production, use an allow-listed typed configuration, validate declared capabilities, smoke-test
the exact account and model, compare normalized usage and quality, and keep rollback explicit.

## Source and extensions

Compare the runnable [OpenAI](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/01_basics/01-text-call.ts),
[Anthropic](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/04_providers_and_multimodal/11-anthropic-text-call.ts),
[Gemini](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/04_providers_and_multimodal/01-gemini-text-call.ts),
[Grok](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/04_providers_and_multimodal/13-grok-live-search.ts),
and [Mistral](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/04_providers_and_multimodal/02-mistral-text-call.ts)
examples. Next, build a provider conformance test and an offline quality evaluation.

- [Choose a provider](/sdk/providers/choose-a-provider)
- [Capability matrix](/sdk/providers/capability-matrix)
