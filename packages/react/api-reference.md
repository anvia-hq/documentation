# Hook API reference

These hooks and their state types are exported from `@anvia/react`. Create transports with
`@anvia/client`. Component families live in the
[primitives API reference](/packages/react/primitives-api-reference).

```ts
import { useChat, useCompletion, useDurableChat, useSmoothStreamItems, useSmoothStreamText } from '@anvia/react'
import { useGraphExplorer } from '@anvia/react/graph-explorer'
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
  maxRetainedEvents,
})
```

`transport` is required and follows `ClientTransport<ClientStreamRequest, Data, Metadata>`. Chat status is `'ready' | 'submitted' | 'streaming' | 'waiting' | 'error'`; `waiting` means a suspended interaction is awaiting a response.

The result exposes readonly `messages`, `events`, `runUsage`, `contextUsage`, `suggestions`, `status`, `error`, `text`, `streamId`, and `isResuming`, plus:

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

`maxRetainedEvents` bounds how many of the newest events the hook keeps. It is a positive safe integer and is
unbounded by default. It truncates the retained event list, not the transcript or `messages`; `onEvent` still
receives every event.

`runUsage` holds the aggregate `Usage` for the latest run; the hook refreshes it from `run_end` and `error` events while per-message usage stays on each assistant message. `contextBreakdown` holds the latest run's scaled segment split, taken from `message_end`, `turn_end`, and `run_end` frames or from a replayed message's `generation`.

## `useDurableChat`

`useDurableChat({ transport, ...useChatOptions })` returns the same result as `useChat()` plus `run`:

```ts
const chat = useDurableChat({ transport })
chat.run.id       // durable run ID, undefined before the first send
chat.run.status   // durable status, independent of chat.status
await chat.run.steer(input)
await chat.run.cancel()
await chat.run.retry()
await chat.run.resolveTool(operationId, output)
await chat.run.resolveMemoryWrite(operationKey, 'applied')
```

The transport must come from `@anvia/client/durable-chat` or expose an equivalent `controller`. Create it once,
not on every render. See [Durable chat hook](/packages/react/durable-chat).

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

The hook also exposes `completion`, `input`, `setInput`, `status`, `error`, `events`, `usage`, and `contextUsage`. It accepts `maxRetainedEvents` with the same bounded-retention behavior as `useChat`. `usage` is the `Usage` reported by the latest run and is replaced by each `complete()` call.

## Stream smoothing

`useSmoothStreamText(content, lifecycle)` paces append-only text. `useSmoothStreamItems(items, { ...lifecycle, adapter })` preserves item ordering while pacing text in keyed items. Both return a `flush()` method.

## `useGraphExplorer`

```ts
import { useGraphExplorer } from '@anvia/react/graph-explorer'

const explorer = useGraphExplorer({
  explore,
  initialResult,
  initialQuery,
  searchText,
})
```

`explore` is required and matches `GraphExplorer['explore']` from the optional `@anvia/graph` peer. The controller exposes readonly `nodes`, `nodeById`, `relationships`, `truncated`, `selectedNodeId`, `selectedNode`, `query`, `matchedNodeIds`, and `error`, with `status` of `'idle' | 'loading' | 'ready' | 'error'`, plus:

```ts
await explorer.explore({ mode: 'overview' })
await explorer.expandNode(nodeId, options)
await explorer.refresh()
explorer.selectNode(nodeId)
explorer.setQuery(query)
explorer.stop()
explorer.reset()
```

Overview results replace the current graph; `expand` results merge by node and relationship ID. Starting a request aborts the previous request, `refresh()` repeats the latest overview with a fresh abort signal, and `expandNode()` inherits the latest successful overview's filters and limits (`nodeTypes`, `relationships`, `includeProvenance`, `maxNodes`, `maxRelationships`) unless overridden. `matchedNodeIds` matches `query` against `searchText` output for local search. The entry point also exports `mergeGraphExploreResults()` and `graphExplorerNodeMatches()`, and the `GraphExplorerController`, `GraphExplorerExpandNodeOptions`, `GraphExplorerStatus`, and `UseGraphExplorerOptions` types.

## Related client API

Use `createHttpClientTransport({ endpoint, format, headers, body, fetch, init })` for HTTP or `createDirectClientTransport({ handler })` for an in-process stream. Public `UIMessage`, client-event, attachment, protocol, and transport types come from `@anvia/client`.
