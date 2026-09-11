# Telegram polling

Polling is the default receive mode: no public HTTP route needed, ideal for workers and local development. See [@anvia/telegram](/channels/telegram) for bot creation and choosing a receive mode.

## Poll for updates

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

`start()` validates the token with `getMe`, then runs the background polling loop. The polling defaults are `timeoutSeconds: 30`, `retryDelayMs: 1_000`, and `limit: 100` (the limit must stay within Telegram's 1–100 range). The loop subscribes with `allowed_updates: ["message", "edited_message", "message_reaction", "callback_query"]` — other update kinds are never delivered (see [Receive scope](/channels/telegram/events)). Successfully handled updates advance the offset; handler failures are reported through `onError` and the update is retried.

Poll failures retry with exponential backoff: `retryDelayMs`, doubling per consecutive failure up to 30 seconds, resetting after a successful poll. Rate-limit responses (`429`) wait exactly the `retry_after` seconds the API returns instead. `onError` receives `context.operation` (`'poll'` or `'handle'`) and `context.errorCode` for Bot API errors, so applications can treat fatal codes such as `401` differently from transient ones.

Unparseable updates never stop the loop: each one is reported through `onError` and skipped, and the offset advances past it when an `update_id` can be extracted.

Polling shutdown aborts an in-flight `getUpdates` and drains the loop; webhook shutdown rejects new deliveries and waits for active ones.

## Continue with

- [Telegram webhooks](/channels/telegram/webhooks) — the hosted alternative to polling.
- [Receive Telegram events](/channels/telegram/events) — the normalized events the loop delivers.
