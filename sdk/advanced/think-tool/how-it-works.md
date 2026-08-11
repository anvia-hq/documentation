# How it works

`createThinkTool()` creates a regular Anvia tool whose only job is to echo a short text checkpoint back into the model-tool loop.

## Tool contract

```ts
import { createThinkTool } from '@anvia/core'

const think = createThinkTool()
```

Its contract is equivalent to:

```ts
type Input = {
  thought: string
}

type Output = string
```

When the model calls it with:

```json
{
  "thought": "The logs and deployment time correlate; check the changed configuration next."
}
```

the tool returns that same text. It does not contact another model, search a knowledge base, write memory directly, or execute an application action.

## Runtime sequence

```text
Model turn
  └─ calls think({ thought })
       └─ Anvia validates the input
            └─ returns the thought as a tool result
                 └─ next model turn continues with that result
```

Because this is a normal tool call, using it requires the model to continue into another turn. Set a turn limit that leaves enough room for the actual tools and final response.

## What the checkpoint changes

The checkpoint makes the model's current decision state explicit in the transcript. It can help the next turn remain focused after several tool results or clarify which missing fact should be collected next.

It does not add facts or guarantee better reasoning. A vague checkpoint simply echoes vague text; a strong instruction is what makes the checkpoint useful.

## What the runtime observes

The call follows the same lifecycle as other tools:

| Stage | Runtime behavior |
| --- | --- |
| Tool request | Validates the `thought` argument. |
| Tool execution | Returns the text without an external side effect. |
| Tool result | Adds the echoed text to the active model transcript. |
| Next turn | Lets the model select another tool or produce the answer. |
| Observability | Reports normal tool activity according to observer capture policy. |

This visibility is useful for evaluation and debugging, but it also means think content should be treated as retained application data rather than invisible chain-of-thought.
