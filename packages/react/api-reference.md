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
  humanInput,
  suggestions,
  onEvent,
  onError,
})
```

`transport` is required and follows `ClientTransport<ClientStreamRequest, Data, Metadata>`.

The result exposes readonly `messages`, `events`, `contextUsage`, `suggestions`, `status`, `error`, `text`, `streamId`, and `isResuming`, plus:

```ts
chat.setMessages(next)
await chat.sendMessage({ text, attachments, metadata })
await chat.regenerate()
chat.stop()
chat.reset()
await chat.resume()
await chat.approveTool({ approvalId, reason })
await chat.rejectTool({ approvalId, reason })
await chat.answerToolQuestion({ questionId, answers })
```

Status is `'ready' | 'submitted' | 'streaming' | 'error'`.

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
