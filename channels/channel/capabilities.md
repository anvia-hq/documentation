# Capabilities and rate limits

Generic channel code should inspect `channel.capabilities` before using an optional operation, and pace outbound calls when the adapter has no built-in rate limiting. See [Channel core](/channels/channel) for the full utility map.

## Advertise capabilities

`channel.capabilities` is optional; generic code should inspect it before presenting a feature or calling an optional operation:

```ts
if (channel.capabilities?.typing === true) {
  await channel.showTyping?.(address)
}

if (channel.capabilities?.reactions === true && channel.react !== undefined) {
  await channel.react(sentMessage, '👍')
}

if (channel.capabilities?.delete === true && channel.delete !== undefined) {
  await channel.delete(sentMessage)
}

if (channel.capabilities?.messageEdits === true && channel.edit !== undefined) {
  await channel.edit(sentMessage, { text: 'Dashboard snapshot (updated)' })
}

if (channel.capabilities?.reactionRemovals === true && channel.unreact !== undefined) {
  await channel.unreact(sentMessage, '👀')
}
```

`capabilities.actions` is the only required flag; `outboundAttachments` lists accepted attachment kinds, and `replies`, `typing`, `reactions`, `reactionRemovals`, `delete`, and `messageEdits` gate the optional operations. The standard adapters advertise their exact support; a custom text-only adapter may omit `capabilities` entirely.

## Pace outbound calls

Wrap any adapter with `createRateLimitedChannel()` to serialize outbound calls (send, edit, delete, typing, reactions) with a minimum spacing between them:

```ts
import { createRateLimitedChannel } from '@anvia/channel'

const paced = createRateLimitedChannel({ channel, minimumIntervalMs: 1_000 })
```

Inbound behavior (`start`, `stop`, attachments, splitting) and the advertised capabilities pass straight through. Discord and Slack SDK clients already rate-limit internally, so the wrapper is most useful for raw-REST adapters such as Telegram, or for application code that fans out many proactive messages.

## Continue with

- [Send channel messages](/channels/channel/sending) — the outbound path these operations pace.
- [Build a custom adapter](/channels/channel/custom-adapter) — advertise the right capabilities for your platform.
