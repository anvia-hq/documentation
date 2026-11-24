# Can my agent run in Discord, Slack, or Telegram?

Yes. Anvia Channels connects an existing Anvia agent to Discord, Slack, or Telegram. A platform adapter turns incoming messages into channel events, and `createChannelAgent()` runs the agent and delivers its reply to the same conversation.

| Package | Use it for |
| --- | --- |
| `@anvia/channel` | Platform-neutral addresses, events, messages, and `sendChannelMessage()` |
| `@anvia/channel-agent` | `createChannelAgent()`, which runs an agent behind any adapter |
| `@anvia/discord`, `@anvia/slack`, `@anvia/telegram` | Discord Gateway, Slack Socket Mode, and Telegram polling or webhooks |

Channels can stream replies into a placeholder message, split long replies at platform limits, and show tool approvals and agent questions as native buttons. A worker can also send messages to a channel without running an agent.

## What should I know first?

Channels is a separate workspace from the SDK. Its packages are published on npm, are pre-1.0 (`0.3`–`0.5`), and require Node.js 24 or newer; `@anvia/channel-agent` declares `@anvia/core` `^1.21.0` as a peer. Your application still owns bot credentials, user authorization, conversation persistence, and deployment.

See [Channels](/features/channels), the [Channels overview](/channels/), and the [end-to-end guide](/channels/end-to-end).

Reviewed against Anvia Channels `bc762e9` and npm on 2026-11-24.
