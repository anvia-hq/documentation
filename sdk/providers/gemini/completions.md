# Completions

Use `completionModel(...)` for direct completions, agents, extractors, structured output, and model-driven pipeline stages.

```ts
import { Agent } from '@anvia/core'
import { GeminiClient } from '@anvia/gemini'

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY!,
})

const model = gemini.completionModel({
    modelId: 'gemini-2.5-flash'
})

export const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly and concisely.',
})
```

The returned streaming completion handle backs agent generation, agent streams, and direct completion helpers.

## Direct completion

Use one direct request when the application owns the surrounding workflow:

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Checkout requests timed out for 12 minutes.',
    model,
    instructions: 'Write one concise internal incident summary.',
    temperature: 0.2,
    maxTokens: 180
})

console.log(result.text)
console.log(result.usage.totalTokens)
```

Use an [agent](/sdk/agents) when the run needs tools, memory, dynamic context, lifecycle policy, or multiple turns.

## Tools and tool choice

Gemini function calls map to Anvia tool calls. The agent runtime validates the arguments, invokes the local handler, and returns its result to the model.

```ts
const agent = new Agent({
  id: 'orders',
  model: model,
  instructions: 'Use get_order for order-specific questions. Never guess status.',
  maxTurns: 4,
  tools: [getOrder],
})
```

The adapter supports automatic, required, disabled, and named tool choice through Anvia's normalized contract. Test required and named calls against the exact model because adapter support does not guarantee identical behavior across all Gemini model IDs.

Direct completion streams expose tool-call events but do not execute a handler. Use an agent stream when the runtime should execute tools and continue the turn.

## Structured output

Gemini supports Anvia output schemas. Use `generateCompletion(...)` when a single call must return schema-validated data:

```ts
import { generateCompletion } from '@anvia/core'
import { z } from 'zod'

const incidentSchema = z.object({
  severity: z.enum(['low', 'medium', 'high']),
  summary: z.string().min(1),
})

const result = await generateCompletion({
    prompt: 'Checkout failed for all users for 12 minutes.',
    model,
    outputSchema: incidentSchema,
    instructions: 'Classify only the supplied incident.'
})

console.log(result.output.severity)
```

The adapter sends a JSON response MIME type and the JSON schema to Google. Anvia still parses and validates the returned data; handle validation failures instead of trusting unvalidated text.

## Reasoning content

Provider-specific thinking configuration belongs at the Gemini model boundary:

```ts
const reasoningAgent = new Agent({
  id: 'analyst',
  model: model,
  providerOptions: {
    config: {
      thinkingConfig: {
        includeThoughts: true,
      },
    },
  },
})
```

When Google returns thought content, the adapter exposes it as normalized reasoning summaries and stream deltas and preserves thought signatures needed in later history.

Reasoning is operational metadata, not normal assistant text. Do not render or retain it by default, and verify the selected model's current thinking options with Google's model documentation.

## Capability boundary

The Gemini completion handle declares support for streaming, tools, tool choice, images, documents, output schemas, and reasoning. Test the exact model, endpoint, region, and request shape used by the product. A capability declared by the adapter is not a promise that every listed model supports it.
