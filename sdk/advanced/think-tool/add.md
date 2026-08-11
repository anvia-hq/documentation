# Add the think tool

Create the built-in tool and register it with the other tools available to the agent.

## Basic setup

```ts
import { AgentBuilder, createThinkTool } from '@anvia/core'

const agent = new AgentBuilder('support-investigator', model)
  .instructions(
    'Use think when you need to compare multiple tool results before answering.',
  )
  .tools([
    createThinkTool(),
    searchTicketsTool,
    getAccountTool,
  ])
  .defaultMaxTurns(6)
  .build()
```

The model decides whether to call the tool. Registering it does not make every request use it, so pair it with a specific instruction.

## Customize the definition

The default name is `think`. Change it if that name already exists or a more precise capability name will guide the model better:

```ts
const evidenceCheckTool = createThinkTool({
  name: 'review_evidence',
  description:
    'Record a concise assessment of the evidence before choosing the next action.',
})
```

| Option | Default | Purpose |
| --- | --- | --- |
| `name` | `think` | Model-facing tool name. |
| `description` | Built-in description | Explains when the model should call it. |

The input and output contract does not change when the tool is renamed:

```ts
type ThinkInput = {
  thought: string
}

type ThinkOutput = string
```

## Add it to the right agents

Do not add think globally merely because an agent can call tools. Attach it to agents whose work actually involves investigation, comparison, or multi-step decisions.

For a large dynamically retrieved catalog, keep think static so it is always available during the run:

```ts
const agent = new AgentBuilder('operations', model)
  .tools([createThinkTool()])
  .dynamicTools(operationsToolIndex, {
    topK: 5,
    threshold: 0.72,
  })
  .build()
```

Static registration makes the checkpoint available on every turn while operational tools are selected from the index.
