# Stream, steer, and cancel a team

`team.stream()` returns a handle for observing and controlling a run in flight. `team.generate()` is its non-streaming form.

## 1. Consume team events

`events` is an attributed union of agent events, member state changes, queued and delivered messages, interactions, and the terminal team outcome. Every event carries `teamRunId` and `instanceId`, so multi-agent output stays attributable.

```ts
const stream = team.stream({ prompt: 'Investigate the proposed architecture.' })

for await (const event of stream.events) {
  if (event.type === 'agent_queued') {
    console.log('queued', event.member.agentId, 'depth', event.member.depth)
  } else if (event.type === 'agent_started') {
    console.log('started', event.member.agentId, event.instanceId, 'depth', event.member.depth)
  } else if (event.type === 'message_delivered') {
    console.log('message', event.message.fromInstanceId, '->', event.message.toInstanceId)
  } else if (event.type === 'agent_event' && event.event.type === 'text_delta') {
    console.log(event.instanceId, event.event.delta)
  }
}
const outcome = await stream.result
```

`textStream` yields coordinator text only, including provisional turns before its final answer; `text` resolves to the final text. Choose one iterable surface (`events` or `textStream`); reading only `await stream.result` also works and consumes the run without buffering unused events. Closing the event iterator cancels unfinished work. Non-streaming models are supported and emit complete response text instead of provider deltas.

## 2. Buffer bound

Streaming buffers at most `limits.maxBufferedEvents` unread events (default 1,024). If a consumer falls behind and fills the buffer, the team cancels its running work, discards unread events, and rejects both the iterator and the final promise with `AgentTeamLimitError` (`limit: 'maxBufferedEvents'`). The bound is on event count, not byte size. Increase the limit to tolerate longer pauses between reads; result-only consumption is unaffected.

## 3. Steer or cancel mid-run

```ts
// From the application, while the team runs:
stream.steer({ prompt: 'Also consider deployment complexity.' })
stream.cancel('User cancelled.')
```

`steer` accepts user messages for the coordinator's current or next assignment; it returns a receipt. `cancel(reason?)` stops the team; cancellation signals reach running models, tools, and resolvers. Work the application owns (external API calls, background tasks) must honor its own abort signal.

## 4. Event types

| Event type | Payload |
| --- | --- |
| `agent_queued` | a newly spawned member, emitted before it acquires a concurrency slot |
| `agent_started`, `agent_waiting`, `agent_idle`, `agent_failed`, `agent_cancelled` | `member` summary (`instanceId`, `agentId`, `status`, `depth`, `parentInstanceId`, usage, outcome) |
| `message_queued`, `message_delivered` | `message` (`fromInstanceId`, `toInstanceId`, `content`, `replyTo?`) |
| `interaction` | the `AgentInteractionRequest` for the application to resolve |
| `agent_event` | an underlying `AgentStreamEvent`, marked `coordinator: true/false` |
| terminal | the `AgentTeamOutcome` — output or blocked reason plus `teamRunId`, aggregate `usage`, and `members` |

Continue with [approvals and questions](/sdk/advanced/multi-agent/agent-teams/approvals).
