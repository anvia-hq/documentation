# Handle channel events

`ChannelEvent` is the normalized inbound shape every adapter delivers. See [Channel core](/channels/channel) for addresses and the full utility map.

## Narrow on event type

`ChannelEvent` is a discriminated union. Narrow `event.type` before reading event-specific fields:

```ts
import type { ChannelEvent } from '@anvia/channel'

function inspect(event: ChannelEvent): void {
  switch (event.type) {
    case 'message':
      console.log(event.text, event.attachments, event.replyTo)
      break
    case 'action':
      console.log(event.messageId, event.actionId)
      break
    case 'command':
      console.log(event.name, event.text)
      break
    case 'message-edited':
      console.log(event.messageId, event.text)
      break
    case 'message-deleted':
      console.log(event.messageId)
      break
    case 'reaction':
      console.log(event.messageId, event.reaction, event.removed)
      break
  }
}
```

Every variant shares `id`, `platform`, `accountId`, and `conversation`; every variant except `message-deleted` also carries `sender`. The original validated platform value stays available as `event.raw`. On `message` events, `mentionedBot` tells you whether the bot was mentioned directly.

## Command events

Adapters emit a shared `command` event for platform slash-command invocations (`/ask …`): `name` carries the command without the leading slash and `text` the argument text (empty when there are none). The [channel agent](/channels/channel-agent/commands) ignores commands by default; opt in with `commands: true`.

## Shape reference

- `conversation` is `{ id, kind, threadId? }`, where `kind` is `'direct'`, `'group'`, or `'channel'`. When replying, copy `conversationId` from `conversation.id` and `threadId` from `conversation.threadId` — not the whole object.
- `sender` is `{ id, displayName?, bot }`.
- `replyTo` on a `message` event is `{ messageId, sender?, text? }`.
- Inbound `attachments` are `{ id, type, mediaType, filename?, size? }`, where `type` is `'image'`, `'audio'`, `'video'`, or `'file'`.

`send()` resolves to a `SentChannelMessage`: `{ id, address }`.

Handlers are async and awaited: a `ChannelEventHandler` returns `Promise<void>`, so a throwing handler reports back through the adapter's `onError` instead of failing silently.

## Continue with

- [Send channel messages](/channels/channel/sending) — reply with `sendChannelMessage()`.
- [Splitting and validation](/channels/channel/splitting) — text limits and portable payload rules.
- [Channel-agent bridge](/channels/channel-agent) — run an agent on these events instead of handling them by hand.
