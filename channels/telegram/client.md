# Telegram client and transport

Use the validated Bot API client when an application needs Bot API operations without the `Channel` abstraction, and the parse/normalize helpers when integrating a custom receive transport. See [@anvia/telegram](/channels/telegram) for standard setup.

## Use the validated client directly

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

- `baseUrl` targets a custom (usually self-hosted) Bot API server; any HTTPS URL is accepted, while plain HTTP works only for `localhost`, `127.0.0.1`, or `::1`.
- `fetch` replaces the Fetch implementation for proxies and test doubles.
- `maximumAttachmentBytes` caps upload and download sizes (20 MiB by default).

Failures surface as `TelegramApiError` carrying `method`, the Bot API `errorCode` when present, and `retryAfterSeconds` for rate limits. Request failures never embed the request URL, so the token cannot leak into error messages.

Five calls retry on HTTP 429 (up to three attempts, honoring Telegram's `retry_after` hint, abort-aware): `sendMessage`, URL-based `sendAttachment`, `editMessageText`, `deleteMessage`, and `setMessageReaction`. `answerCallbackQuery`, `sendChatAction`, `getMe`, `getUpdates`, downloads, and multipart (base64) uploads never retry. For steadier pacing on top of retries, wrap the adapter with [`createRateLimitedChannel()`](/channels/channel/capabilities).

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

## Continue with

- [Telegram polling](/channels/telegram/polling) and [webhooks](/channels/telegram/webhooks) — the built-in receive modes.
- [Receive Telegram events](/channels/telegram/events) — the normalized events.
