# Think tool

The think tool gives an agent an explicit checkpoint between gathering information and choosing its next action. It is useful when a run requires comparison, planning, or a deliberate pause before another tool call.

## Explore the think tool

| Page | Learn how to |
| --- | --- |
| [Add the tool](/sdk/advanced/think-tool/add) | Register `createThinkTool()` and customize its name. |
| [How it works](/sdk/advanced/think-tool/how-it-works) | Understand the tool call, echoed result, and extra model turn. |
| [When to use](/sdk/advanced/think-tool/when-to-use) | Decide whether a workflow benefits from a checkpoint. |
| [Instructions](/sdk/advanced/think-tool/instructions) | Tell the model when and what to record. |
| [Privacy and visibility](/sdk/advanced/think-tool/privacy) | Handle think calls as transcript data. |
| [Production checklist](/sdk/advanced/think-tool/checklist) | Review cost, policy, observability, and tests. |

## Add a checkpoint

```ts
import { AgentBuilder, createThinkTool } from '@anvia/core'

const agent = new AgentBuilder('incident-review', model)
  .instructions([
    'Investigate the incident using the available evidence.',
    'Use think after gathering evidence and before proposing remediation.',
    'Keep the checkpoint concise and do not include secrets.',
  ].join('\n'))
  .tools([
    createThinkTool(),
    searchLogsTool,
    getDeploymentTool,
  ])
  .build()
```

When the model calls `think`, Anvia accepts `{ thought: string }` and returns the same text as the tool result. Nothing is retrieved and no external side effect occurs.

```text
model requests evidence
        ↓
tools return observations
        ↓
model calls think with a short checkpoint
        ↓
think echoes the checkpoint
        ↓
model chooses another tool or answers
```

## Use the right mental model

Think is a normal tool, not a hidden scratchpad. Its call and result can appear in runtime events, traces, and stored messages according to the same rules as other tool activity.

It can improve deliberate tool use, but it does not enforce approval, authorization, or business policy. Keep those controls in tool handlers, hooks, and application code.
