# Telegram webhooks

Webhook delivery suits an existing HTTPS application server: Telegram pushes updates to your route instead of the adapter polling. See [@anvia/telegram](/channels/telegram) for bot creation and choosing a receive mode.

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

In webhook mode `start()` still validates the token with `getMe` but starts no loop; updates arrive only through `receiveWebhook()`, which rejects when the channel is not running, the secret does not match, or the body does not parse. A `callback_query` update is auto-answered before your handler runs — if answering fails, the handler never runs and `receiveWebhook()` rejects. Return a non-2xx response when it rejects so Telegram can retry. The package does not register the external webhook URL: that remains deployment configuration because the adapter does not know the application's public route. Concurrent redeliveries of one update share the same in-flight handler execution, and an update that has already been handled is dropped.

## Continue with

- [Telegram polling](/channels/telegram/polling) — the default loop-based alternative.
- [Receive Telegram events](/channels/telegram/events) — the normalized events webhooks deliver.
