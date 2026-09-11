# @anvia/channel

`@anvia/channel` is the platform-neutral foundation for channels: it defines addresses, normalized events, portable messages, splitting, runtime validation, and the `Channel` interface every adapter implements, with no dependency on `@anvia/core` or a platform SDK.

The package is currently a private workspace package in the channels monorepo; `@anvia/channel` is its intended npm name.

## Pick the right utility

| Task                                   | Utility                                  |
| -------------------------------------- | ---------------------------------------- |
| Describe a destination                 | `ChannelAddress`                         |
| Describe portable output               | `ChannelMessage`                         |
| Receive normalized platform input      | `ChannelEvent` and `ChannelEventHandler` |
| Send potentially long output           | `sendChannelMessage()`                   |
| Send one already-bounded message       | `channel.send()`                         |
| Split a complete portable message      | `splitChannelMessage()`                  |
| Split raw text only                    | `splitChannelText()`                     |
| Validate a whole portable payload      | `validateChannelMessage()`               |
| Validate portable buttons              | `validateChannelActions()`               |
| Validate portable outbound files       | `validateChannelAttachments()`           |
| Check whether an action ID is portable | `isChannelActionId()`                    |
| Implement a new adapter                | `Channel<RawEvent>`                      |

For a normal Discord, Slack, or Telegram application, create the channel with the platform factory ([Discord](/channels/discord), [Slack](/channels/slack), [Telegram](/channels/telegram)) and use only the shared types plus `sendChannelMessage()` from this package.

## Addresses

A `ChannelAddress` identifies where output should go:

```ts
import type { ChannelAddress } from '@anvia/channel'

const address: ChannelAddress = {
  platform: 'discord',
  accountId: '123456789012345678',
  conversationId: '234567890123456789',
  threadId: '345678901234567890',
}
```

- `platform` must match the adapter.
- `accountId` distinguishes two bot/application accounts on the same platform and is optional.
- `conversationId` is the channel, chat, or direct-message conversation.
- `threadId` is the platform thread/topic identifier when present.

When replying to an incoming event, copy these fields from `event.platform`, `event.accountId`, and `event.conversation` instead of reconstructing platform IDs.

## Continue with

- [Send channel messages](/channels/channel/sending) — `sendChannelMessage()`, URL attachments, and partial delivery.
- [Handle channel events](/channels/channel/events) — the normalized `ChannelEvent` union.
- [Splitting and validation](/channels/channel/splitting) — text limits and portable payload rules.
- [Capabilities and rate limits](/channels/channel/capabilities) — optional operations and pacing.
- [Build a custom adapter](/channels/channel/custom-adapter) — implement `Channel<RawEvent>`.
