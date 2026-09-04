# Build a channel application end to end

This tutorial assembles a complete channel application — platform adapter, and either an agent bridge, a raw event handler, or a proactive sender — and finishes with the shutdown checklist.

## 1. Choose the application shape

| Desired behavior | Required packages | Main utility |
| --- | --- | --- |
| Send alerts and reports only | `@anvia/channel` plus one adapter | `sendChannelMessage()` |
| Receive events and run application code | one adapter | `channel.start(handler)` |
| Receive events and run an Anvia agent | one adapter, `@anvia/channel-agent`, `@anvia/core` | `createChannelAgent()` |
| Build a reusable custom adapter | `@anvia/channel` | `Channel` interface |

Do not add `@anvia/channel-agent` to a sender-only worker, and do not use raw platform clients when a standard adapter already owns the connection.

## 2. Create the adapter

Each platform package exports one factory:

```ts
import { discord } from '@anvia/discord'
import { slack } from '@anvia/slack'
import { telegram } from '@anvia/telegram'

const discordChannel = discord({ token: process.env.DISCORD_BOT_TOKEN! })
const slackChannel = slack({
  appToken: process.env.SLACK_APP_TOKEN!,
  botToken: process.env.SLACK_BOT_TOKEN!,
})
const telegramChannel = telegram({ token: process.env.TELEGRAM_BOT_TOKEN! })
```

Choose exactly one adapter per bridge service. An application may run several services when it intentionally exposes the same or different agents on several platforms. Adapter credentials come from your deployment environment, not from the packages.

## 3. Run an agent end to end

The adapter owns platform behavior; `createChannelAgent()` owns filtering, prompts, streaming, conversation serialization, interaction resumption, and the adapter lifecycle.

```ts
import { mkdir } from 'node:fs/promises'
import { createChannelAgent, SqliteChannelAgentInteractionStore } from '@anvia/channel-agent'
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { telegram } from '@anvia/telegram'

await mkdir('data', { recursive: true })

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}

const openai = new OpenAIClient({ apiKey })
const model = openai.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' })
const agent = new Agent({
  id: 'support-agent',
  model,
  instructions: 'Answer concisely and do not disclose secrets.',
})

const channel = telegram({
  token: process.env.TELEGRAM_BOT_TOKEN!,
  onError(error, context) {
    console.error('telegram', context.operation, error)
  },
})

const interactions = new SqliteChannelAgentInteractionStore({
  database: 'data/channel-interactions.sqlite',
})

const service = createChannelAgent({
  channel,
  agent,
  interactions: { store: interactions },
  streaming: { placeholder: 'Thinking…', editIntervalMs: 750 },
  onError(error, context) {
    console.error('channel-agent', context.stage, error)
  },
})

await service.start()
```

This single program already provides: default filtering, per-sender conversation memory sessions, streaming edits with a placeholder, long-message splitting, and durable resumption of paused approvals and questions.

`SqliteChannelAgentInteractionStore` persists paused continuations across restarts. It is separate from the agent's conversation-memory store; configure agent memory through `@anvia/core` when history must also survive restarts (see [Memory](/sdk/memory)).

## 4. Choose conversation scope

The default session scope isolates history by platform, bot account, conversation, thread, and sender. Change it only when the product needs shared group history:

```ts
import { channelConversationSession } from '@anvia/channel-agent'

const service = createChannelAgent({
  channel,
  agent,
  createSession: channelConversationSession,
})
```

Use `channelConversationUserSession()` to state the default explicitly, or a custom `createSession` returning `undefined` to run selected events without memory. The scope decision matters most when memory is configured; without a memory store the bridge runs without sessions.

## 5. Choose attachment policy

Incoming attachment metadata is normalized by the adapter, and `channelMessagePrompt()` loads the bytes only when the bridge prepares a prompt. Default limits are 10 files, 20 MiB per file, 50 MiB total, and two concurrent loads.

```ts
const service = createChannelAgent({
  channel,
  agent,
  multimodal: {
    maximumAttachments: 5,
    maximumAttachmentBytes: 10 * 1024 * 1024,
    maximumTotalAttachmentBytes: 25 * 1024 * 1024,
    attachmentConcurrency: 2,
  },
})
```

Set `multimodal: false` when the selected model or application must reject file input.

## 6. Alternative: raw event handler

Start the adapter directly when you want normalized events without an agent:

```ts
import { sendChannelMessage } from '@anvia/channel'
import { telegram } from '@anvia/telegram'

const channel = telegram({ token: process.env.TELEGRAM_BOT_TOKEN! })

await channel.start(async (event) => {
  if (event.type !== 'message') return

  await sendChannelMessage({
    channel,
    address: { platform: event.platform, conversationId: event.conversation.id },
    message: { text: `Received ${event.text.length} characters.` },
  })
})
```

Handle the `event.type` values you need: `message`, `action`, `message-edited`, `message-deleted`, or `reaction`. When you started an adapter directly, `channel.stop()` — not a bridge service — owns shutdown.

## 7. Alternative: proactive sender

Use `sendChannelMessage()` for reports, alerts, and generated output. It takes one options object, delegates text limits to the adapter, sends every part in order, and keeps actions and attachments on the final part:

```ts
import { sendChannelMessage } from '@anvia/channel'
import { discord } from '@anvia/discord'

const channel = discord({ token: process.env.DISCORD_BOT_TOKEN! })

const sent = await sendChannelMessage({
  channel,
  address: { platform: 'discord', conversationId: process.env.DISCORD_CHANNEL_ID! },
  message: {
    text: 'Build 184 passed.',
    attachments: [
      {
        type: 'file',
        mediaType: 'application/json',
        filename: 'summary.json',
        source: { type: 'data', data: Buffer.from('{"passed":true}').toString('base64') },
      },
    ],
    actions: [{ id: 'build:184:details', label: 'Show details', style: 'primary' }],
  },
})

console.log(sent.map((message) => message.id))
```

A failure mid-split throws `PartialDeliveryError` carrying the parts already delivered, so record application-level delivery IDs and make retries idempotent. Use `channel.send()` only when the input is already one platform-sized logical message. A proactive-only process never calls `start()`, so it has no receive loop to stop.

## 8. Shut down every owned resource

Stop the highest-level owner: a bridge service stops its adapter and drains queued conversation work. Then close the databases it may still use:

```ts
let shutdownPromise: Promise<void> | undefined

function shutdown(): Promise<void> {
  shutdownPromise ??= (async () => {
    try {
      await service.stop()
    } finally {
      interactions.close()
    }
  })()
  return shutdownPromise
}

process.once('SIGINT', () => void shutdown())
process.once('SIGTERM', () => void shutdown())
```

The memoized promise makes the handler idempotent across both signals. Before deployment, check:

- every token arrives through the environment and each adapter gets the credentials it needs;
- the conversation scope matches the product (per-sender versus shared channel history);
- a tool-capable agent uses `SqliteChannelAgentInteractionStore` when paused approvals must survive restarts;
- externally mutating tools stay idempotent, because retried interaction resumes are not exactly-once;
- `errorMessage` and interaction replies say what you want users to see on failure.

## Continue with

- [Channel-agent bridge](/channels/channel-agent) — every option `createChannelAgent()` accepts.
- [Channel core](/channels/channel) — addresses, splitting, validation, and custom adapters.
- [Discord](/channels/discord), [Slack](/channels/slack), [Telegram](/channels/telegram) — platform guides.
- [Your first agent](/sdk/your-first-agent) — build the agent this guide connects to a channel.
