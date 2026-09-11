# Anvia Channels

Anvia Channels is a set of platform adapters that connect Discord, Slack, and Telegram to the Anvia runtime in strict TypeScript. Adapters normalize incoming platform payloads into `ChannelEvent` values and deliver outbound messages through each platform's native API.

Channels are a separate workspace from the [Anvia SDK](/sdk/). The SDK owns the model and agent runtime; Channels own platform input and delivery. Your application keeps owning credentials, persistence, and deployment.

The five libraries are currently private workspace packages while live-platform verification completes. They are not published to npm yet; the package names below are the intended installation names.

## Packages

| Package | Use it for | Start with |
| --- | --- | --- |
| `@anvia/channel` | Platform-neutral addresses, events, messages, validation, and delivery helpers | `sendChannelMessage()` |
| `@anvia/channel-agent` | Running an Anvia agent behind any channel adapter | `createChannelAgent()` |
| `@anvia/discord` | Discord Gateway input and REST delivery | `discord()` |
| `@anvia/slack` | Slack Socket Mode input and Web API delivery | `slack()` |
| `@anvia/telegram` | Telegram polling, webhook input, and Bot API delivery | `telegram()` |

## Platform capabilities

| Platform | Receive transport | Files | Native actions | Replies and threads | Typing |
| --- | --- | --- | --- | --- | --- |
| Discord | Gateway | Yes | Buttons | Yes | Yes |
| Slack | Socket Mode | Yes | Block Kit buttons | Yes | No |
| Telegram | Long polling or webhook | Yes | Inline keyboard | Yes | Yes |

All three adapters expose message edits, deletion, and reactions. Optional operations are advertised through `channel.capabilities`.

## Run an agent on a channel

Create a platform adapter, pass it and an existing Anvia agent to `createChannelAgent()`, and start the returned service:

```ts
import { createChannelAgent } from '@anvia/channel-agent'
import { telegram } from '@anvia/telegram'

const channel = telegram({ token: process.env.TELEGRAM_BOT_TOKEN! })
const service = createChannelAgent({
  channel,
  agent,
  streaming: { placeholder: 'Thinking…' },
})

await service.start()

process.once('SIGTERM', () => {
  void service.stop()
})
```

The bridge handles default message filtering, stable conversation sessions, multimodal prompts, streaming edits, long-message splitting, native actions, and paused approval or question flows. It also handles platform slash commands (opt-in per command), acknowledgement reactions while the agent works, and reaction cleanup on completion. See [Channel-agent bridge](/channels/channel-agent).

## Send proactively

An alerting or worker process only needs a platform adapter and `sendChannelMessage()`. Receiving does not need to be started:

```ts
import { sendChannelMessage } from '@anvia/channel'
import { discord } from '@anvia/discord'

const channel = discord({ token: process.env.DISCORD_BOT_TOKEN! })

await sendChannelMessage({
  channel,
  address: { platform: 'discord', conversationId: process.env.DISCORD_CHANNEL_ID! },
  message: {
    text: monitoringReport,
    actions: [{ id: 'incident:ack', label: 'Acknowledge', style: 'primary' }],
  },
})
```

`sendChannelMessage()` splits long text according to the selected platform. Use `channel.send()` only for one already-bounded logical message. See [Channel core](/channels/channel).

## Choose a utility

| You need to… | Use | Package |
| --- | --- | --- |
| Represent a platform-independent address or message | `ChannelAddress`, `ChannelMessage` | `@anvia/channel` |
| Send output that may exceed a platform text limit | `sendChannelMessage()` | `@anvia/channel` |
| Split text in a custom adapter | `splitChannelMessage()` or `splitChannelText()` | `@anvia/channel` |
| Validate portable buttons or files at runtime | `validateChannelActions()`, `validateChannelAttachments()` | `@anvia/channel` |
| Create a Discord adapter | `discord()` | `@anvia/discord` |
| Create a Slack adapter | `slack()` | `@anvia/slack` |
| Create a Telegram adapter | `telegram()` | `@anvia/telegram` |
| Connect an adapter to an existing Anvia agent | `createChannelAgent()` | `@anvia/channel-agent` |
| Preserve incoming attachments in a custom prompt | `channelMessagePrompt()` | `@anvia/channel-agent` |
| Keep approvals/questions across restarts | `SqliteChannelAgentInteractionStore` | `@anvia/channel-agent` |

## Continue with

- [End-to-end guide](/channels/end-to-end) — assemble a complete bot, agent, or proactive sender.
- [Channel core](/channels/channel) — shared contracts, splitting, validation, and custom adapters.
- [Channel-agent bridge](/channels/channel-agent) — connect any adapter to an agent.
- [Discord](/channels/discord), [Slack](/channels/slack), [Telegram](/channels/telegram) — platform guides.
