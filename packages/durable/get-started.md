# Get started

Register an agent with an explicit version, open a runtime on a dedicated SQLite file, resume unfinished
work, then submit and observe a run.

```ts
import { Agent } from '@anvia/core/agent'
import { DurableRuntime } from '@anvia/durable'
import { SqliteDurableStore } from '@anvia/durable/sqlite'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const researcher = new Agent({
  id: 'researcher',
  model: client.completionModel({ modelId: 'gpt-5.6', api: 'responses' }),
  instructions: 'Produce a concise research brief from the supplied material.',
})

const runtime = await DurableRuntime.open({
  store: new SqliteDurableStore('./anvia-runs.sqlite'),
  agents: [{ agent: researcher, version: '1' }],
  maxConcurrentRuns: 4,
})

try {
  await runtime.resume() // discover unfinished work from the previous process
  const run = await runtime.submit({
    agentId: researcher.id,
    sessionId: 'research-session',
    requestId: 'research-job-42',
    prompt: 'Summarize these research notes: ...',
  })

  for await (const event of run.stream()) {
    console.log(event.type, event.data)
  }
  const outcome = await run.result()
  if (outcome.type === 'response') console.log(outcome.output)
} finally {
  await runtime.close()
}
```

## Lifecycle

- Create the runtime once at application scope and keep it alive in a server or worker. A client disconnect
  should close only that client's subscription.
- `runtime.resume()` schedules pending and interrupted runs without waiting for them to finish. It does not
  restart your process; arrange process startup with a supervisor.
- `run.cancel()` persists an explicit cancellation. Closing a stream or aborting `result()` only detaches
  that subscriber.
- `runtime.close()` aborts active attempts, waits for callbacks to settle, and releases storage. Interrupted
  work keeps its checkpoints for the next process; it is not recorded as cancelled. Models and tools must
  honor their abort signals for a prompt shutdown.

## Submissions are deduplicated

`(sessionId, requestId)` identifies a submission. Repeating it returns the original run; sending different
content under the same pair is rejected. Reuse the request ID when you retry a client request. Session IDs
organize history and deduplication; they are not authentication.

## Image and document prompts

`prompt` is a nonblank string or a core `UserMessage`, so images and files work without a separate API:

```ts
const run = await runtime.submit({
  agentId: researcher.id,
  sessionId: 'image-chat',
  requestId: 'image-message-1',
  prompt: {
    role: 'user',
    content: [
      { type: 'text', text: 'Describe this image.' },
      {
        type: 'image',
        image: { type: 'data', data: imageBase64 }, // raw base64, without a data-URL prefix
        mediaType: 'image/png',
      },
    ],
  },
})
```

See [Configuration](/packages/durable/configuration#multimodal-prompts) for validation, deduplication, and
payload-size behavior.

## Reopen and observe

```ts
const run = await runtime.getRun(savedRunId)
const snapshot = await run.snapshot()
render(snapshot)
for await (const event of run.stream({ after: snapshot.cursor, abortSignal })) {
  renderEvent(event)
}
```

A snapshot atomically contains the run, its saved operations, and an event cursor. Subscribe after that
cursor to avoid missing or repeating events.

## Next

- [Capabilities](/packages/durable/capabilities) for recovery policies and what is supported.
- [Configuration](/packages/durable/configuration) for streaming, retry, queues, and limits.
- [Durable execution guide](/sdk/advanced/durable-execution) for task-oriented walkthroughs.
