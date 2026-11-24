# Durable chat hook

`useDurableChat()` wraps [`useChat()`](/packages/react/state-and-streaming) for a transport created by
`@anvia/client/durable-chat`. It returns the chat state plus the durable run behind it, so an application can
show run status and steer, cancel, retry, or reconcile without reaching into the transport.

```sh anvia-check durable-react-hook-example
import { DurableClient } from '@anvia/client/durable'
import { createDurableChatTransport } from '@anvia/client/durable-chat'
import { useDurableChat } from '@anvia/react'

const client = new DurableClient({
  endpoint: 'https://your-app.example/durable',
  headers: () => ({ Authorization: 'Bearer application-token' }),
})

const transport = createDurableChatTransport({
  client,
  agentId: 'researcher',
  sessionId: 'chat-42',
})

export function useResearchChat() {
  const chat = useDurableChat({ transport })

  return {
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    isStreaming: chat.status === 'streaming',
    runId: chat.run.id,
    runStatus: chat.run.status,
    steer: chat.run.steer,
    cancel: chat.run.cancel,
  }
}
```

## 1. Reuse one transport

The transport remembers the active run. Create it once — at module scope, or with `useMemo`/`useState` keyed on
agent and session — rather than on every render. Set `resume: { key }` on the hook to reattach to a run that
outlived the page after a reload.

## 2. Read both statuses

`chat.status` describes the client stream (`ready`, `submitted`, `streaming`, `waiting`, `error`). `chat.run.status` is the durable run status
(`queued`, `running`, `waiting`, `retry_wait`, `needs_attention`, …). They differ while an approval is pending or
a retry deadline has not arrived. `chat.run.id` is undefined before the first send or resume.

## 3. Control the run

| Control | Effect |
| --- | --- |
| `run.steer(input)` | Adds user input at the run's next model step. |
| `run.cancel()` | Persists cancellation. `chat.stop()` only detaches the stream. |
| `run.retry()` | Retries a failed or blocked run under its recovery policies. |
| `run.resolveTool(operationId, output)` | Reconciles an uncertain tool call after verifying the external result. |
| `run.resolveMemoryWrite(operationKey, 'applied' \| 'discarded')` | Settles a blocked recorded memory write. |

Every control acts on the run the chat last submitted or resumed. Results and reconciliation are
application-authorized decisions; render them only for callers allowed to make them.

## 4. Know the contract

The hook needs a transport whose `controller` implements `activeRunId`, `status`, `subscribe`, `steer`,
`cancel`, `retry`, `resolveTool`, and `resolveMemoryWrite`. `createDurableChatTransport()` provides it; a custom
transport must match the structural contract. `@anvia/react` declares these types locally and does not depend
on `@anvia/durable`.
