# Golden path: SDK, Discord, and Lens

A runnable, production-shaped Anvia application used by the
[golden-path tutorial](/examples/golden-path). One process:

- answers order questions on Discord through `@anvia/channel-agent`;
- keeps durable per-conversation memory in SQLite;
- exposes typed tools (`lookup_order`, `list_open_orders`) over application-owned data;
- exports every run to Lens with safe capture and per-conversation sessions;
- can deliver a proactive operations report without receiving anything.

## Requirements

- Node.js 24 or newer (the memory and interaction stores use `node:sqlite`).
- pnpm 11 or newer.
- A Discord application with a bot token and the **Message Content Intent** enabled.
- An OpenAI API key, or any OpenAI-compatible endpoint through `OPENAI_BASE_URL`.
- A reachable Lens deployment with a project ingestion key pair.

## Run it

```sh
pnpm install
cp .env.example .env      # then fill in the values
pnpm start
```

Send a direct message to the bot, or mention it in the configured channel, and the bridge
streams an answer back. The trace is exported to Lens in the background.

Proactive delivery, with no receive loop and no gateway connection:

```sh
pnpm monitor
```

## Validate it

The smoke test runs the complete path in-process: a scripted OpenAI-compatible endpoint, a fake
Discord gateway, and a local OTLP receiver. It needs no credentials and no network access.

```sh
pnpm test
pnpm typecheck
```

It asserts that an inbound message reaches the agent, that the typed tool runs, that the answer is
delivered back through the adapter, and that the exported trace contains the `agent.*`,
`model.turn.*`, and `tool.*` spans with the conversation session, token usage, and no captured
prompt, tool argument, or tool result bodies.

## Files

| Path | Purpose |
| --- | --- |
| `src/config.ts` | Reads and validates every environment variable once, at startup. |
| `src/app.ts` | Composes model, agent, memory, Lens observer, channel, and bridge service. |
| `src/orders.ts` | Application-owned data behind the tools. |
| `src/tools.ts` | Typed tools with runtime-validated input schemas. |
| `src/index.ts` | Long-running process with graceful shutdown. |
| `src/monitor.ts` | Proactive sender for scheduled reports. |
| `test/smoke.test.ts` | End-to-end validation without credentials. |

Never commit a filled `.env`, bot token, API key, or real customer data.
