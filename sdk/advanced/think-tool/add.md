# Add the think tool

Create the built-in tool and register it with the concrete tools available to the agent.

## 1. Use the default tool

```ts
import { Agent, createThinkTool } from '@anvia/core'

const agent = new Agent({
  id: 'support-investigator',
  model,
  instructions:
    'Use think when you must compare multiple tool results before answering.',
  tools: [
    createThinkTool(),
    searchTicketsTool,
    getAccountTool,
  ],
  maxTurns: 6,
})
```

Registration makes the definition available to the model. The model still decides whether to call it, so give a specific instruction describing the useful decision boundary.

## 2. Customize its definition

```ts
const evidenceCheck = createThinkTool({
  name: 'review_evidence',
  description:
    'Record a concise assessment of the evidence before choosing the next action.',
})
```

`name` defaults to `think`. `description` defaults to a built-in explanation that the tool records a thought without retrieval, memory storage, or external state changes.

Changing either option does not change the input and output contract:

```ts
type ThinkInput = {
  thought: string
}

type ThinkOutput = string
```

## 3. Keep it static when needed

```ts
const agent = new Agent({
  id: 'operations',
  model,
  tools: [
    createThinkTool(),
    operationsToolIndex,
  ],
})
```

A normal tool is visible on every turn. A `ToolIndex` contributes only dynamically selected definitions, so this arrangement keeps the checkpoint available while retrieving operational tools.

## 4. Add it selectively

Use think for agents that genuinely compare evidence or make multi-step decisions. Adding it to every tool-capable agent increases prompt surface and may encourage unnecessary turns.

Next, understand [how it works](/sdk/advanced/think-tool/how-it-works).
