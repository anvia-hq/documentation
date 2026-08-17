# Think tool

The think tool adds an explicit text checkpoint to a multi-turn tool loop. It can help an agent compare evidence and choose its next action after one or more tool results.

```text
Model requests evidence
  -> tools return observations
  -> model calls think with a concise checkpoint
  -> think echoes the checkpoint
  -> the next model turn chooses another tool or answers
```

## 1. Add a checkpoint

```ts
import { Agent, createThinkTool } from '@anvia/core'

const agent = new Agent({
  id: 'incident-review',
  model,
  instructions: [
    'Investigate the incident using the available evidence.',
    'Use think after gathering evidence and before proposing remediation.',
    'Record only the supported conclusion, uncertainty, and next action.',
    'Do not include secrets or raw personal data.',
  ].join('\n'),
  tools: [
    createThinkTool(),
    searchLogsTool,
    getDeploymentTool,
  ],
  maxTurns: 6,
})
```

The default tool is named `think`. It accepts `{ thought: string }`, validates the input, and returns the same string.

## 2. Use the right mental model

Think is a normal tool, not a hidden scratchpad. Its call and echoed result can appear in stream events, traces, memory, and stored messages according to the application's configuration.

It performs no retrieval, memory write, model call, or external side effect. Its value comes from making a small decision artifact available to the next model turn.

## 3. Keep enforcement in code

A checkpoint may improve tool choice, but it cannot authorize an operation or guarantee that the model follows policy. Keep input validation, permissions, approval, idempotency, and side-effect protection in the actual tools and application services.

## 4. Continue through the section

- [Add and customize the tool](/sdk/advanced/think-tool/add)
- [Understand the runtime sequence](/sdk/advanced/think-tool/how-it-works)
- [Choose when to use it](/sdk/advanced/think-tool/when-to-use)
- [Write bounded instructions](/sdk/advanced/think-tool/instructions)
- [Protect privacy and visibility](/sdk/advanced/think-tool/privacy)
- [Review the production checklist](/sdk/advanced/think-tool/checklist)
