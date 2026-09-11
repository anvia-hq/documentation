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

Every variant shares `id`, `platform`, `accountId`, `conversation`, and `sender` where applicable; the original validated platform value stays available as `event.raw`. Platform adapters runtime-validate external payloads before producing these events. On `message` events, `mentionedBot` tells you whether the bot was mentioned directly.

## Continue with

- [Send channel messages](/channels/channel/sending) — reply with `sendChannelMessage()`.
- [Splitting and validation](/channels/channel/splitting) — text limits and portable payload rules.
- [Channel-agent bridge](/channels/channel-agent) — run an agent on these events instead of handling them by hand.
