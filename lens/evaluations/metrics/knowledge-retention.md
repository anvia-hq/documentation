# knowledgeRetention

Checks whether the assistant preserves information the user supplied earlier.

## When to use

An assistant must remember facts the user gave earlier in the same conversation.

## Why use it

It catches contradictions, forgotten facts, and unnecessary repeat questions.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { knowledgeRetention, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'knowledge-retention-example',
  cases: [
    {
      id: 'remember-name',
      input: 'Evaluate this conversation for forgotten facts.',
    },
  ],
  target: async () => [
    { role: 'user', content: 'My name is Maya.' },
    { role: 'assistant', content: 'How can I help, Maya?' },
    { role: 'user', content: 'What name should you use on my ticket?' },
    { role: 'assistant', content: 'What is your name?' },
  ],
  metrics: [
    knowledgeRetention({ model: judgeModel, threshold: 1 }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

If the judge finds knowledge loss in the second assistant reply but not the first, the score is `0.5`. That fails this example’s threshold of `1`.

## What it needs

Requires a completion `model` and conversation turns. Higher is better: the fraction of checked assistant replies with no knowledge loss.

The default threshold is `0.5`; this example sets one explicitly. A score at or above the threshold passes. `strictMode: true` requires a score of 1. `includeReason` defaults to `true` so the outcome includes a final explanation.

## Keep in mind

Provide a nonempty array of user/assistant turns, messages, or an output object with `messages`. The judge extracts user-supplied facts and checks subsequent replies for forgetting, contradiction, or needless repeat questions. No eligible replies produces a score of 1; include cases where a later reply must use earlier information.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[turnRelevancy](/lens/evaluations/metrics/turn-relevancy), [promptAlignment](/lens/evaluations/metrics/prompt-alignment).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
