# `@anvia/react` API reference

`@anvia/react` exports React hooks and their state types. Create transports with `@anvia/client`.

```ts
import { useChat, useCompletion, useSmoothStreamItems, useSmoothStreamText } from '@anvia/react'
import { createHttpClientTransport } from '@anvia/client'
```

## `useChat`

```ts
const chat = useChat({
  transport,
  initialMessages,
  resume: { key, storage, auto },
  suggestions,
  onEvent,
  onError,
})
```

`transport` is required and follows `ClientTransport<ClientStreamRequest, Data, Metadata>`. Chat status is `'ready' | 'submitted' | 'streaming' | 'waiting' | 'error'`; `waiting` means a suspended interaction is awaiting a response.

The result exposes readonly `messages`, `events`, `contextUsage`, `suggestions`, `status`, `error`, `text`, `streamId`, and `isResuming`, plus:

```ts
chat.setMessages(next)
await chat.sendMessage({ text, attachments, metadata })
await chat.regenerate()
chat.stop()
chat.reset()
await chat.resume()
chat.interactions.all
chat.interactions.pending
chat.respondingInteractions
await chat.respondToInteraction({
  interactionId,
  response: { type: 'tool-approval', approved: true },
})
```

For a structured question, pass `{ type: 'tool-question', answers: [{ questionId, value }] }` as the response. The pending entry contains the complete `AgentInteractionRequest` under `request`.

## `useCompletion`

```ts
const completion = useCompletion({
  transport,
  initialInput,
  initialCompletion,
  onEvent,
  onError,
})

await completion.complete({ prompt, metadata })
await completion.submit()
completion.stop()
completion.reset()
```

The hook also exposes `completion`, `input`, `setInput`, `status`, `error`, `events`, and `contextUsage`.

## Stream smoothing

`useSmoothStreamText(content, lifecycle)` paces append-only text. `useSmoothStreamItems(items, { ...lifecycle, adapter })` preserves item ordering while pacing text in keyed items. Both return a `flush()` method.

## Related client API

Use `createHttpClientTransport({ endpoint, format, headers, body, fetch, init })` for HTTP or `createDirectClientTransport({ handler })` for an in-process stream. Public `UIMessage`, client-event, attachment, protocol, and transport types come from `@anvia/client`.
