# Stream text

**Type:** Recipe

## Outcome

Stream one direct completion as normalized events and print visible text as soon as each
`text_delta` arrives. Use this when the application owns the workflow and a terminal or UI should
show progress instead of waiting for the complete response.

## Prerequisites

- Node.js 22 or newer and pnpm
- `OPENAI_API_KEY` with access to a streaming-capable model
- The setup from [Basic completion](./basic-completion)

## Implementation

Save as `stream-text.ts`:

```ts
import { createCompletionStream } from '@anvia/core/completion'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error('Set OPENAI_API_KEY.')

const model = new OpenAIClient({ apiKey }).completionModel('gpt-5')

for await (const event of createCompletionStream(model, {
  instructions: 'Write one concise paragraph.',
  input: 'Explain event streams.',
})) {
  if (event.type === 'text_delta') process.stdout.write(event.delta)

  if (event.type === 'final') {
    process.stdout.write('\n')
    console.log('tokens:', event.response.usage.totalTokens)
  }
}
```

## Run and expected behavior

```bash
pnpm tsx stream-text.ts
```

Text appears incrementally. The terminal then prints normalized usage from the final response.
Other completion event types can represent reasoning, tool-call content, sources, or an error; do
not assume every event contains visible text. A direct completion does not execute tool calls or
repeat model turns.

## Boundaries

Streaming improves perceived latency, not total model latency. The selected model must declare
streaming support. Treat partial output as untrusted and incomplete: a disconnected client may have
seen only part of the answer, while provider work may already have started.

In production, translate events with `@anvia/server`, propagate client disconnects, apply output
guardrails before exposing sensitive content, and record the final event rather than reconstructing
authoritative state from displayed deltas.

## Source and extensions

The public API and capability behavior are covered by the
[`createCompletionStream` source](https://github.com/anvia-hq/anvia/blob/main/packages/core/src/completion/create-completion.ts)
and its
[capability tests](https://github.com/anvia-hq/anvia/blob/main/packages/core/test/completion-capabilities.test.ts).
For the agent-level equivalent, run the
[stream-text cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/01_basics/04-stream-text.ts),
then compare its
[JSONL readable stream](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/01_basics/05-readable-stream-jsonl.ts).
Next, add tool-event rendering or connect the stream to a React transport.

- [Completion streams](/sdk/streaming/completion-streams)
- [Cancellation](../agents-and-tools/cancellation)
