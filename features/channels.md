# Channels

Anvia Channels connects an Anvia agent to Discord, Slack, or Telegram. A platform adapter turns incoming messages into `ChannelEvent` values, and the agent bridge runs the agent and delivers its reply back to the same conversation.

## When to use it

- Users should talk to an agent from Discord, Slack, or Telegram instead of a custom web interface.
- A reply should stream into a placeholder message and split automatically when it exceeds the platform's text limit.
- Tool approvals and agent questions should appear as native buttons and resume when someone answers.
- A worker or alerting process should send reports to a channel without receiving messages.

## How it works

Channels is a separate workspace from the SDK, made of five packages:

| Package | Role |
| --- | --- |
| `@anvia/channel` | Platform-neutral addresses, events, messages, splitting, and `sendChannelMessage()` |
| `@anvia/channel-agent` | `createChannelAgent()`, which runs an Anvia agent behind any adapter |
| `@anvia/discord`, `@anvia/slack`, `@anvia/telegram` | Platform adapters: Discord Gateway, Slack Socket Mode, and Telegram polling or webhooks |

Create one adapter, pass it and an existing agent to `createChannelAgent()`, and start the returned service. The service owns the adapter lifecycle, so do not also call `channel.start()`:

```ts
import { createChannelAgent } from '@anvia/channel-agent'
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { telegram } from '@anvia/telegram'

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const agent = new Agent({
  id: 'support-agent',
  model: openai.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' }),
  instructions: 'Answer concisely and do not disclose secrets.',
})

const service = createChannelAgent({
  channel: telegram({ token: process.env.TELEGRAM_BOT_TOKEN! }),
  agent,
  streaming: { placeholder: 'Thinking…' },
})

await service.start()
process.once('SIGTERM', () => void service.stop())
```

By default the bridge handles direct messages and mentions, serializes runs within a conversation, streams text through message edits, and splits long final output. When the agent has a memory store, each sender also gets its own memory session scope; without one, runs have no conversation history. Filtering, prompt building, and interaction rendering are configurable; slash commands and acknowledgement reactions are opt-in.

To send without receiving, use `sendChannelMessage()` from `@anvia/channel` with just an adapter. See [Sending](/channels/channel/sending).

## What your application owns

- **Credentials**: bot and app tokens come from your deployment environment, not from the packages.
- **Authorization**: the default filter decides which messages reach the agent, not who may use which tools. Enforce permissions in tool handlers and with `shouldHandle` when needed.
- **Persistence**: paused approvals and questions are kept in memory unless you configure an interaction store such as `SqliteChannelAgentInteractionStore`. Conversation history survives restarts only if the agent's memory store does.
- **Deployment**: process lifecycle, graceful shutdown with `service.stop()`, webhook exposure for Telegram, and running one service per platform.

## Go deeper

- [Anvia Channels](/channels/): packages, platform capabilities, and choosing a utility
- [End-to-end guide](/channels/end-to-end): assemble a complete bot, agent bridge, or proactive sender
- [Channel-agent bridge](/channels/channel-agent): bridge options, filtering, delivery, and interactions
- [Approvals and interactions](/channels/channel-agent/interactions): paused tool approvals and questions
- [Channel core](/channels/channel): shared contracts, splitting, validation, and custom adapters
- [Discord](/channels/discord), [Slack](/channels/slack), [Telegram](/channels/telegram): platform guides
