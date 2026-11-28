# `toolCalled`, `toolNotCalled`, `toolCallOrder`, `maxTurns`, `maxTokens`, `maxDurationMs`

These metrics read the agent's messages and usage instead of its final text. They turn "the assistant said the right thing" into "the assistant behaved within budget".

```ts
import {
  agentEvalTarget, maxDurationMs, maxTokens, maxTurns,
  toolCalled, toolCallOrder, toolNotCalled,
} from '@anvia/core/evals'

await runEvalSuite({
  name: 'refund-handling',
  cases: [{ id: 'lookup', input: 'Where is order A-1?', tags: ['tools'] }],
  target: agentEvalTarget(agent),
  metrics: [
    toolCalled('lookup_order'),
    toolNotCalled('issue_refund'),
    toolCallOrder(['lookup_order', 'send_reply']),
    maxTurns(4),
    maxTokens(8_000),
    maxDurationMs(15_000),
  ],
})
```

## What each metric reads

| Metric | Reads | Default score rule |
| --- | --- | --- |
| `toolCalled(name)` | `tool-call` parts in assistant messages | Passes when the call count is within `minCalls` (default `1`) and `maxCalls`. |
| `toolNotCalled(name)` | the same | Passes when the tool is never called. |
| `toolCallOrder(tools)` | the same, in message order | Passes when the tools appear as a subsequence; `strict: true` requires exact length and order. |
| `maxTurns(max)` | assistant message count | Numeric score equals the turn count; passes at or below `max`. |
| `maxTokens(max)` | usage on the output | Numeric score equals the token count; `field` selects `total` (default), `input`, or `output`. |
| `maxDurationMs(max)` | `targetDurationMs` by default | Numeric score is the duration in milliseconds; passes at or below `max`. |

The three budget metrics report `threshold` equal to their cap, so a failing gate names the budget it broke.

## Options that matter

- `toolCalled`: `toolName`, `minCalls`, `maxCalls`, `args` (a partial deep-equal record or a predicate), and `messages`.
- `toolNotCalled`: `toolName` and `messages`.
- `toolCallOrder`: `tools`, `strict`, and `messages`.
- `maxTurns`: `max` and `messages`.
- `maxTokens`: `max`, `field` (`total`, `input`, or `output`), and `usage`.
- `maxDurationMs`: `max` and `durationMs`, a selector that defaults to the recorded `targetDurationMs`.

Every metric also accepts `name` and `required`.

## Score names

Read results from `scores` with each metric's default name, or pass `name` to choose your own:

| Metric | Default name in `scores` |
| --- | --- |
| `toolCalled('lookup_order')` | `tool_called_lookup_order` |
| `toolNotCalled('issue_refund')` | `tool_not_called_issue_refund` |
| `toolCallOrder([...])` | `tool_call_order` |
| `maxTurns(4)` | `max_turns` |
| `maxTokens(8_000)` | `max_tokens` |
| `maxDurationMs(15_000)` | `max_duration_ms` |

Construction fails early rather than at judgment time: a blank `toolName`, an empty `tools` array, a non-positive `maxTurns`, a negative `maxTokens`, or a non-finite `maxDurationMs` throw when the metric is created.

## Reading messages from a custom output

By default these metrics read `args.output`, which must be an `AgentResponse`, a `Message[]`, or an object with `messages`. With `agentEvalTarget(agent)` that works because the response carries messages; when you pass your own `output` mapper, supply `messages: ({ output }) => output.messages` or the metric returns `invalid` with "requires an AgentResponse, Message[], or an output with messages".

Only assistant messages contribute tool calls, so a tool result echoed in a user turn never counts.

`maxDurationMs` judges the recorded duration, including the value restored from a target cache hit; a cached run can therefore fail a duration budget even though nothing ran. Use [`cachedEvalTarget`](/sdk/evaluations/trials-and-caching#decorate-a-target-with-a-cache) deliberately with latency budgets.
