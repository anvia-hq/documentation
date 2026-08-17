# How the think tool works

`createThinkTool()` returns a regular Anvia tool whose implementation echoes one validated string.

## 1. Inspect the contract

```ts
import { createThinkTool } from '@anvia/core'

const think = createThinkTool()
```

The input and output are equivalent to:

```ts
type Input = {
  thought: string
}

type Output = string
```

Given this call:

```json
{
  "thought": "The deployment time matches the first errors; inspect the changed configuration next."
}
```

the tool returns the value of `thought`. It does not contact another model, retrieve documents, persist memory directly, or perform an application action.

## 2. Follow the runtime sequence

```text
Model emits think({ thought })
  -> Anvia validates the argument
  -> tool returns the same text
  -> result enters the active transcript
  -> next model turn continues from that result
```

The call consumes a tool turn and requires another model turn to continue. Leave enough `maxTurns` for evidence gathering, the checkpoint, any later actions, and the final answer.

## 3. Understand what changes

The echoed result makes a concise decision state explicit to the next turn. This may help after several observations or when the model must choose which missing fact to collect.

It adds no new facts and guarantees no improvement. A vague checkpoint merely echoes vague text; bounded instructions and evaluation determine whether the extra turn is worthwhile.

## 4. Treat it as normal tool activity

The runtime applies the normal tool path: input parsing, configured lifecycle handling, middleware, observers, stream events, transcript updates, and subsequent model generation.

That visibility helps evaluation and debugging, but it also makes the checkpoint retained application data rather than hidden chain-of-thought.

Next, decide [when to use it](/sdk/advanced/think-tool/when-to-use).
