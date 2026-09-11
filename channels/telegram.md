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

The token format (`<bot id>:<hash>` — digits, a colon, then letters/digits/`_`/`-`) is validated when the adapter is constructed from a `token`. With `telegram({ api })` there is no token to validate: a custom `TelegramBotApi` takes over API access entirely and forbids the other options. Pass either `polling` or `webhook`, never both. Telegram cannot deliver through `getUpdates` while a webhook is configured, so remove the webhook before switching a bot back to polling. See the official [Telegram Bot API](https://core.telegram.org/bots/api) for bot creation, webhook registration, and delivery requirements.

## Run an agent on the channel

```ts
import { createChannelAgent } from '@anvia/channel-agent'

const service = createChannelAgent({ channel, agent })
await service.start()
```

Use the default polling mode for the simplest executable. For a web service, construct the same service with the webhook channel, call `service.start()` during application startup, and forward requests to `channel.receiveWebhook()`. The prompt, session, streaming, and interaction options are documented in [Channel agent](/channels/channel-agent). Stop the service instead of the adapter when it owns the channel.

## Continue with

- [Telegram polling](/channels/telegram/polling) — the default loop-based receive mode.
- [Telegram webhooks](/channels/telegram/webhooks) — hosted webhook delivery.
- [Telegram messaging](/channels/telegram/messaging) — send, buttons, attachments, edits, and reactions.
- [Receive Telegram events](/channels/telegram/events) — normalized updates, reactions, and edits.
- [Telegram client and transport](/channels/telegram/client) — validated client and custom transports.
