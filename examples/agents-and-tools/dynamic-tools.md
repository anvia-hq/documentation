# Dynamic tools

A `ToolIndex` retrieves relevant definitions from a large catalog instead of sending every tool to every model turn.

## Build the index

```ts
import { Agent, createTool } from '@anvia/core';
import { createToolIndex } from '@anvia/core/tool';
import { z } from 'zod';
const issueRefund = createTool({
    name: 'issue_refund',
    description: 'Issue a refund for a customer order.',
    inputSchema: z.object({ orderId: z.string() }),
    outputSchema: z.string(),
    execute: ({ orderId }) => `refund queued for ${orderId}`,
});
const updateAddress = createTool({
    name: 'update_address',
    description: 'Update the shipping address for an order.',
    inputSchema: z.object({
        orderId: z.string(),
        address: z.string(),
    }),
    outputSchema: z.string(),
    execute: ({ orderId }) => `address updated for ${orderId}`,
});
const toolIndex = await createToolIndex({
    model: embeddingModel,
    tools: [issueRefund, updateAddress],
    topK: 1,
    minScore: 0.9
});
```

`embeddingModel` is any Anvia embedding model. Tool names and descriptions become retrieval content.

## Attach it like any other tool source

```ts
const agent = new Agent({
  id: 'support',
  model: completionModel,
  tools: [toolIndex],
})

const result = await agent.generate({
    prompt: 'Refund order A-100.'
})
```

The runtime retrieves definitions from the index for each turn. A refund prompt should expose `issue_refund` while omitting the unrelated address tool.

Retrieval is not authorization. Every selected tool still requires normal scope and policy checks. Evaluate recall on representative prompts: an excessive minScore can hide a required tool, while a permissive one can expose irrelevant choices.

Version and cache the index, keep descriptions free of secrets, and test selected definitions with a deterministic embedding model before measuring end-to-end tool-call accuracy.

Continue with the full [dynamic tools guide](/sdk/advanced/dynamic-tools).
