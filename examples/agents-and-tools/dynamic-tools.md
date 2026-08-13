# Dynamic tools

**Type:** Pattern

## Outcome

Retrieve only the tools relevant to the current prompt instead of sending an entire large catalog
to the model. Use this for dozens or hundreds of narrow tools where smaller tool context improves
cost and model selection.

## Prerequisites

- A set of accurately named and described Anvia tools
- An `EmbeddingModel` appropriate for the tool descriptions
- `createToolIndex` from `@anvia/core/tool`

## Build and attach the index

```ts
import { Agent } from '@anvia/core/agent'
import { createTool, createToolIndex } from '@anvia/core/tool'
import { z } from 'zod'

const issueRefund = createTool({
  name: 'issue_refund',
  description: 'Issue a refund for a customer order.',
  input: z.object({ orderId: z.string() }),
  output: z.string(),
  execute: ({ orderId }) => `refund queued for ${orderId}`,
})

const updateAddress = createTool({
  name: 'update_address',
  description: 'Update the shipping address for an order.',
  input: z.object({ orderId: z.string(), address: z.string() }),
  output: z.string(),
  execute: ({ orderId }) => `address updated for ${orderId}`,
})

const toolIndex = await createToolIndex(embeddingModel, [issueRefund, updateAddress])

const agent = new Agent({
  id: 'support',
  model: completionModel,
  dynamicTools: [{ index: toolIndex, topK: 1, threshold: 0.9 }],
})

const response = await agent.prompt('Refund order A-100.').send()
```

`embeddingModel` and `completionModel` are provider-neutral Anvia model instances. Select concrete
providers as shown in the package guides.

## Run and expected behavior

For a refund prompt, the index should expose `issue_refund` and omit unrelated definitions. Dynamic
retrieval occurs from prompt text on each turn; results depend on tool descriptions, embedding
quality, `topK`, and the threshold, so assert selected definitions with a deterministic embedding
model in tests.

## Boundaries

Retrieval is not authorization. The index can narrow what the model sees, but every returned tool
still needs normal policy checks. A threshold that is too high can hide a required tool; one that is
too low can surface irrelevant or dangerous choices. Never put secrets in tool descriptions.

In production, version and cache the index, evaluate recall on representative prompts, maintain a
small always-available safe set where needed, and measure both retrieval relevance and end-to-end
tool-call accuracy.

## Source and extensions

The
[dynamic-tools cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/02_tools/09-dynamic-tools.ts)
uses deterministic fake models to prove exactly which tool reaches each completion turn. Next, use
a real embedding adapter and build an offline retrieval evaluation set.

- [Dynamic tools](/sdk/advanced/dynamic-tools)
- [Tool security](/sdk/tools/security)
