# @anvia/telegram

`@anvia/telegram` adapts Telegram's Bot API to the shared channel interface: delivery runs through the Bot API, and updates arrive through long polling or an application-hosted webhook. Start with `telegram()` unless you need the validated Bot API client directly.

## Which utility should I use?

| Task                                           | Utility                                                 |
| ---------------------------------------------- | ------------------------------------------------------- |
| Polling bot or proactive sender                | `telegram()`                                            |
| Hosted webhook bot                             | `telegram({ webhook })` plus `channel.receiveWebhook()` |
| Supply a fake or custom API client             | `telegram({ api })`                                     |
| Call validated Bot API operations directly     | `createTelegramBotApiClient()`                          |
| Validate an unknown Telegram update            | `parseTelegramUpdate()`                                 |
| Convert a validated update into channel events | `normalizeTelegramUpdate()`                             |
| Handle structured API failures                 | `TelegramApiError`                                      |

`normalizeTelegramUpdate()` returns an array because one Telegram reaction update can produce several removed/added `reaction` events.

## Create the bot

Create a bot with [BotFather](https://t.me/BotFather), copy its token into a secret manager, and choose one receive mode:

- long polling for workers, local development, and processes without a public HTTP route;
- webhook delivery for an existing HTTPS application server.

The token format (`<bot id>:<hash>`) is validated when the adapter is constructed. Pass either `polling` or `webhook`, never both. Telegram cannot deliver through `getUpdates` while a webhook is configured, so remove the webhook before switching a bot back to polling. See the official [Telegram Bot API](https://core.telegram.org/bots/api) for bot creation, webhook registration, and delivery requirements.

## Poll for updates

Polling is the default:

```ts
import { telegram } from '@anvia/telegram'

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required')
}

const channel = telegram({
  token,
  polling: {
    timeoutSeconds: 30,
    retryDelayMs: 1_000,
    limit: 100,
  },
  maximumAttachmentBytes: 20 * 1024 * 1024,
  onError(error, context) {
    console.error('telegram', context.operation, error)
  },
})

await channel.start(handler)
```

`start()` validates the token with `getMe`, then runs the background polling loop. The polling defaults are `timeoutSeconds: 30`, `retryDelayMs: 1_000`, and `limit: 100` (the limit must stay within Telegram's 1–100 range). Successfully handled updates advance the offset; handler failures are reported through `onError` and the update is retried.

Poll failures retry with exponential backoff: `retryDelayMs`, doubling per consecutive failure up to 30 seconds, resetting after a successful poll. Rate-limit responses (`429`) wait exactly the `retry_after` seconds the API returns instead. `onError` receives `context.operation` (`'poll'` or `'handle'`) and `context.errorCode` for Bot API errors, so applications can treat fatal codes such as `401` differently from transient ones.

Unparseable updates never stop the loop: each one is reported through `onError` and skipped, and the offset advances past it when an `update_id` can be extracted.

## Receive webhooks

The adapter validates a secret your application configures: 1–256 characters from letters, digits, `_`, and `-`, compared against Telegram's `X-Telegram-Bot-Api-Secret-Token` header with a timing-safe comparison. Configure the same secret through Telegram's `setWebhook` call:

```ts
import { telegram } from '@anvia/telegram'

const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET

if (!secretToken) {
  throw new Error('TELEGRAM_WEBHOOK_SECRET is required')
}

const channel = telegram({ token, webhook: { secretToken } })

await channel.start(handler)

// Inside a Fetch-compatible POST handler:
const payload: unknown = await request.json()
const secret = request.headers.get('x-telegram-bot-api-secret-token') ?? undefined
await channel.receiveWebhook(payload, secret)
return new Response(null, { status: 204 })
```

In webhook mode `start()` still validates the token with `getMe` but starts no loop; updates arrive only through `receiveWebhook()`, which rejects when the channel is not running, the secret does not match, or the body does not parse. Return a non-2xx response when it rejects so Telegram can retry. The package does not register the external webhook URL: that remains deployment configuration because the adapter does not know the application's public route. Concurrent redeliveries of one update share the same in-flight handler execution, and an update that has already been handled is dropped.

## Send messages

Bot API delivery does not require the receive loop to be started:

```ts
import { sendChannelMessage } from '@anvia/channel'

await sendChannelMessage({
  channel,
  address: { platform: 'telegram', conversationId: '-1001234567890', threadId: '42' },
  message: {
    text: 'Release candidate ready.',
    replyToMessageId: '1234',
    actions: [
      { id: 'release:approve', label: 'Approve', style: 'primary' },
      { id: 'release:deny', label: 'Deny', style: 'danger' },
    ],
  },
})
```

Numeric chat IDs may be negative, and public channel targets may use an `@username`. Message IDs and topic IDs must be positive safe integers represented as strings in the shared channel API; the address `threadId` targets a forum topic. Text longer than 4,096 characters is split into parts before delivery. The portable payload rules live in [@anvia/channel](/channels/channel).

## Actions and callback queries

Actions become a single row of inline keyboard buttons: `label` is the button text and `id` is the `callback_data`. Telegram renders every button identically, so the portable `style` hint is accepted but not visualized. The shared limits apply: at most 5 actions per message with IDs of at most 64 UTF-8 bytes.

Pressing a button delivers a `callback_query` update. The adapter answers the query automatically and emits an `action` event:

```ts
await channel.start(async (event) => {
  if (event.type === 'action') {
    console.log(event.sender.id, event.actionId, event.messageId)
  }
})
```

Callback data outside the portable limit never becomes an event. Send actions through the shared API and the constraint is already enforced, so every button you ship round-trips.

## Receive normalized events

```ts
await channel.start(async (event) => {
  if (event.type === 'message') {
    console.log(event.text, event.attachments, event.replyTo, event.mentionedBot)
  }

  if (event.type === 'reaction') {
    console.log(event.reaction, event.removed)
  }
})
```

- Updates authored by the bot itself are filtered out before delivery.
- `mentionedBot` is true when a message mentions the bot by username or inline text mention, addresses a command to it, or replies to one of its messages.
- The chat type maps to `conversation.kind`: `private` becomes `direct`, groups and supergroups become `group`, and channels become `channel`.
- Ordinary emoji reactions are preserved. Custom emoji become `telegram:custom_emoji:<id>` and paid reactions become `telegram:paid`; anonymous reactions use the acting chat as the normalized sender.
- Message edits arrive as `message-edited` events carrying the new text and attachments.

## Attachments

Incoming events expose file IDs as normalized metadata: photos arrive as the largest available size, voice messages map to the `audio` type, and documents with an image MIME type map to `image`. `channel.loadAttachment()` resolves that metadata to bytes:

```ts
const attachment = event.attachments[0]
const data = await channel.loadAttachment(event, attachment)

if (data.type === 'data') {
  const bytes = Buffer.from(data.data, 'base64')
}
```

The call invokes `getFile`, downloads through the token-bearing URL internally, caps the response at `maximumAttachmentBytes` (20 MiB by default), and returns base64 data. Authenticated URLs are never exposed to callers or models.

Outbound files may use base64 data or HTTPS URLs. URL sources are validated by the shared package, and Telegram downloads them itself; base64 sources are uploaded as multipart data. The attachment kind selects the Bot API method: `image` uses `sendPhoto`, `audio` uses `sendAudio`, `video` uses `sendVideo`, and `file` uses `sendDocument`. Several attachments use several Bot API calls and can be partially delivered when a later call fails.

## Edits, deletes, reactions, and typing

The adapter implements the full optional `Channel` surface, and `channel.capabilities` advertises `actions`, `replies`, `typing`, `reactions`, `delete`, `messageEdits`, and outbound `image`, `audio`, `video`, and `file` attachments:

```ts
const address = { platform: 'telegram', conversationId: '-1001234567890', threadId: '42' }

await channel.showTyping(address)
await channel.react(sent, '👍')
await channel.edit(sent, { text: 'Release candidate is live.' })
await channel.delete(sent)
```

`sent` is a `SentChannelMessage` from `channel.send()` or an element of the array returned by `sendChannelMessage()`. Editing is text-only: a message with attachments or a reply target cannot be edited, and editing a message without actions clears its inline keyboard. `react()` sets a single emoji reaction, replacing the bot's previous reaction on that message. `showTyping()` sends the `typing` chat action and honors the address `threadId`.

## Run an agent on the channel

```ts
import { createChannelAgent } from '@anvia/channel-agent'

const service = createChannelAgent({ channel, agent })
await service.start()
```

Use the default polling mode for the simplest executable. For a web service, construct the same service with the webhook channel, call `service.start()` during application startup, and forward requests to `channel.receiveWebhook()`. The prompt, session, streaming, and interaction options are documented in [Channel agent](/channels/channel-agent). Stop the service instead of the adapter when it owns the channel.

## Use the validated client directly

Use `createTelegramBotApiClient()` when an application needs Bot API operations without the `Channel` abstraction:

```ts
import { createTelegramBotApiClient, TelegramApiError } from '@anvia/telegram'

const api = createTelegramBotApiClient({ token })

try {
  const bot = await api.getMe()
  console.log(bot.username)
} catch (error) {
  if (error instanceof TelegramApiError) {
    console.error(error.method, error.errorCode, error.retryAfterSeconds)
  }
}
```

The client exposes `getMe`, `getUpdates`, `sendMessage`, `sendAttachment`, `editMessageText`, `answerCallbackQuery`, `deleteMessage`, `sendChatAction`, `setMessageReaction`, and `downloadFile`. Options beyond the token:

- `baseUrl` targets a local Bot API server; HTTPS is required except for `localhost`, `127.0.0.1`, or `::1` over HTTP.
- `fetch` replaces the Fetch implementation for proxies and test doubles.
- `maximumAttachmentBytes` caps upload and download sizes (20 MiB by default).

Failures surface as `TelegramApiError` carrying `method`, the Bot API `errorCode` when present, and `retryAfterSeconds` for rate limits. Request failures never embed the request URL, so the token cannot leak into error messages.

## Integrate a custom receive transport

At an untrusted HTTP boundary, validate first, then normalize:

```ts
import { normalizeTelegramUpdate, parseTelegramUpdate } from '@anvia/telegram'

const parsed = parseTelegramUpdate(payload)
const events = normalizeTelegramUpdate(parsed, bot)
```

`parseTelegramUpdate()` throws a `TypeError` for a missing or non-integer `update_id` or a malformed recognized field, and it ignores unrecognized update kinds. `bot` is the `TelegramUser` from `getMe()`; normalization needs it for the event `accountId` and `mentionedBot` detection. Do not normalize raw unknown JSON without parsing it first.

## Shutdown

```ts
await channel.stop()
```

Polling shutdown aborts an in-flight `getUpdates` and drains the loop; webhook shutdown rejects new deliveries and waits for active ones.
