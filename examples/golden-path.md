# Golden path: one agent, one channel, one trace

**Level:** Application

## Outcome

Build one production-shaped Anvia application that answers order questions on Discord, calls typed
tools over application-owned data, keeps durable conversation memory, and exports every run to
Lens. The same program also delivers a proactive operations report without receiving anything.

The complete project lives in
[`examples/golden-path`](https://github.com/anvia-hq/documentation/tree/main/examples/golden-path)
in this repository, and its smoke test runs the whole path offline — no Discord token, provider
key, or Lens deployment required:

```sh
cd examples/golden-path
pnpm install
pnpm test
```

**Difficulty:** Intermediate

**Estimated time:** 30 minutes with Lens, Discord, and provider credentials already available.
Allow another 45–90 minutes if you must deploy Lens first.

## What the application does

```text
Discord message
  -> Discord gateway            (bot transport, owned by the adapter)
    -> @anvia/discord           normalizes the platform payload into a ChannelEvent
      -> @anvia/channel-agent   filters, builds the prompt, derives the conversation session
        -> Agent                @anvia/core runs the model/tool loop
          -> lookup_order       typed tool over application-owned data
          -> model provider     OpenAI-compatible completion
        <- reply text
      <- placeholder message, streamed edits, final answer
    <- Lens trace: agent.<name> with model.turn.* and tool.* children
```

Three properties matter more than the wiring:

- **The application stays the system of record.** Orders live in `src/orders.ts`; the model only
  reaches them through typed tools, so permissions and validation stay in application code.
- **One process owns one lifecycle.** The Lens client, the agent, the channel adapter, and the
  SQLite stores start together and shut down in a defined order.
- **Telemetry is configuration, not instrumentation.** The Lens observer is attached in one place
  and records structure, timing, and usage without changing the agent result.

## Prerequisites

- Node.js 24 or newer — the memory and interaction stores use `node:sqlite`.
- pnpm 11 or newer.
- A running Lens deployment with a project ingestion key pair. See
  [Install and setup](/lens/install-and-setup).
- A Discord application with a bot token. Enable **Message Content Intent** for the bot, invite it
  to a server, and note the numeric channel id where it should answer. See
  [Discord](/channels/discord).
- An OpenAI API key, or any OpenAI-compatible endpoint configured through `OPENAI_BASE_URL`.
- Outbound HTTPS from the application host to the model provider and to Lens.

Keep every credential server-side. Do not put the Discord token, provider key, or Lens secret key
in browser code, screenshots, or committed files.

## Packages

| Package | Version | Purpose |
| --- | --- | --- |
| `@anvia/core` | `^1.5.0` | Agent, typed tools, memory contracts, observability options |
| `@anvia/openai` | `^1.1.5` | Completion model adapter |
| `@anvia/memory-sqlite` | `^1.2.0` | Durable per-conversation message history |
| `@anvia/discord` | `^0.3.0` | Discord Gateway input and REST delivery |
| `@anvia/channel` | `^0.4.0` | Platform-neutral addresses, messages, and proactive delivery |
| `@anvia/channel-agent` | `^0.4.1` | Agent bridge: filtering, sessions, streaming, interaction resumption |
| `@anvia/lens` | `^1.2.0` | Native Lens tracing (owns its OpenTelemetry providers) |
| `zod` | `^4.6.5` | Tool input schemas |

```sh
mkdir anvia-golden-path
cd anvia-golden-path
pnpm init
pnpm pkg set type=module
pnpm add @anvia/core @anvia/openai @anvia/memory-sqlite @anvia/discord @anvia/channel @anvia/channel-agent @anvia/lens zod
pnpm add --save-dev @types/node tsx typescript
```

`@anvia/lens` brings its own OpenTelemetry dependencies. Do not add a global OpenTelemetry SDK to
make this work, and do not register the same observer providers globally.

## 1. Describe the environment once

Every value the application cannot invent is read and validated in one place, so a misconfigured
deploy fails at startup with one message instead of inside a provider call.

::: code-group

```dotenv [.env.example]
OPENAI_API_KEY=sk-replace-me
# Optional: point the OpenAI adapter at a gateway, proxy, or local mock.
# OPENAI_BASE_URL=https://gateway.example.com/v1
OPENAI_MODEL_ID=gpt-5.6-sol

DISCORD_BOT_TOKEN=replace-me
# Channel where the bot answers and where proactive reports are delivered.
DISCORD_CHANNEL_ID=000000000000000000

ANVIA_LENS_BASE_URL=http://localhost
ANVIA_LENS_PUBLIC_KEY=pk-lens-replace-me
ANVIA_LENS_SECRET_KEY=sk-lens-replace-me
ANVIA_LENS_SERVICE_NAME=golden-path-support
ANVIA_LENS_ENVIRONMENT=development
ANVIA_LENS_RELEASE=local
```

```ts [src/config.ts]
export function loadConfig(env: Readonly<Record<string, string | undefined>> = process.env): GoldenPathConfig {
  const missing: string[] = []

  // Both readers treat a blank value as absent, so `.env` lines that are left
  // empty or copied from the template behave like missing values.
  const required = (name: string): string => {
    const value = env[name]?.trim()
    if (value !== undefined && value.length > 0) return value
    missing.push(name)
    return ''
  }

  const optional = (name: string): string | undefined => env[name]?.trim() || undefined

  const lens = {
    baseUrl: required('ANVIA_LENS_BASE_URL'),
    publicKey: required('ANVIA_LENS_PUBLIC_KEY'),
    secretKey: required('ANVIA_LENS_SECRET_KEY'),
    serviceName: optional('ANVIA_LENS_SERVICE_NAME') ?? DEFAULTS.lensServiceName,
    environment: optional('ANVIA_LENS_ENVIRONMENT') ?? DEFAULTS.lensEnvironment,
    release: optional('ANVIA_LENS_RELEASE'),
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill it in.`,
    )
  }

  return { openai, discord, lens, agent }
}
```

:::

`ANVIA_LENS_BASE_URL` is the Lens origin a browser uses. Do not append `/api` or an OTLP path;
`@anvia/lens` builds its own ingestion URLs from the origin.

## 2. Keep data behind typed tools

Tools are the only path from the model to application data. The input schema is both the
model-facing contract and the runtime validation boundary.

::: code-group

```ts [src/orders.ts]
export function createOrderStore(orders: readonly Order[] = SEED_ORDERS): OrderStore {
  const byId = new Map(orders.map((order) => [order.id.toUpperCase(), order]))

  return {
    find(orderId) {
      return byId.get(orderId.trim().toUpperCase())
    },
    open() {
      return [...byId.values()].filter((order) => order.status !== 'delivered')
    },
  }
}
```

```ts [src/tools.ts]
export function createOrderTools(store: OrderStore) {
  const lookupOrder = createTool({
    name: 'lookup_order',
    description: 'Look up one customer order by its id and return its current status.',
    inputSchema: z.object({
      orderId: z.string().min(1).describe('Order id as printed on the confirmation, for example A-1042.'),
    }),
    execute: async ({ orderId }) => {
      const order = store.find(orderId)

      if (order === undefined) {
        return { orderId, found: false as const }
      }

      return {
        orderId: order.id,
        found: true as const,
        customer: order.customer,
        status: order.status,
        carrier: order.carrier ?? null,
        eta: order.eta ?? null,
      }
    },
  })

  return [lookupOrder, listOpenOrders] as const
}
```

:::

In a real application this store is a database client with the caller's authorization applied
first. A tool that returns another tenant's rows is an authorization bug, not a prompt problem.

## 3. Create the agent, memory, and Lens observer

The Lens client is created once per process. It owns isolated trace and log providers, so it never
replaces the application's own OpenTelemetry setup.

::: code-group

```ts [src/app.ts]
  // One Lens client per process: it owns isolated trace and log providers and
  // never touches a global OpenTelemetry provider. Construction does no I/O.
  const lens = new LensClient({
    baseUrl: config.lens.baseUrl,
    publicKey: config.lens.publicKey,
    secretKey: config.lens.secretKey,
    serviceName: config.lens.serviceName,
    environment: config.lens.environment,
    release: config.lens.release,
    timeoutMs: 10_000,
  })

  const model = new OpenAIClient({
    apiKey: config.openai.apiKey,
    baseUrl: config.openai.baseUrl,
  }).completionModel({ modelId: config.openai.modelId, api: 'chat' })

  // Durable conversation memory also gives every channel conversation the
  // session identity that the Lens observer records.
  const memory = new SqliteMemoryClient({ path: config.agent.memoryDatabase })
  const memoryStore = memory.memoryStore()
  await memoryStore.ensure()

  const agent: Agent = new Agent({
    id: config.agent.id,
    name: config.agent.name,
    model,
    instructions: INSTRUCTIONS,
    maxTurns: 6,
    tools: createOrderTools(orders),
    memory: { store: memoryStore, savePolicy: 'turn' },
    observability: {
      // Safe capture keeps prompt and response bodies out of Lens by default.
      observers: { lens: lens.observer({ captureMode: 'safe' }) },
      primaryTrace: 'lens',
    },
  })
```

:::

`captureMode: 'safe'` records structure, status, timings, model identity, and token usage while
omitting prompts, tool arguments, tool results, and responses. Capture policy is a deployment
decision: read [capture and privacy](/lens/connect/anvia/capture-and-privacy) before switching to
full capture, and review retention with your team.

## 4. Connect the channel

`createChannelAgent()` owns filtering, prompt construction, conversation serialization, streaming
edits, and interaction resumption. The adapter stays responsible for platform behavior.

::: code-group

```ts [src/app.ts]
  const channel =
    options.gateway === undefined
      ? discord({
          token: config.discord.botToken,
          messageContentIntent: true,
          onError(error, context) {
            console.error(`[discord] ${context.operation} failed`, error)
          },
        })
      : new DiscordChannel({ gateway: options.gateway })

  const service = createChannelAgent({
    channel,
    agent: withConversationContext(agent),
    interactions: { store: interactionStore },
    streaming: { placeholder: 'Checking the order…', editIntervalMs: 900 },
    onError(error, context) {
      console.error(`[channel-agent] ${context.stage} failed`, error)
    },
  })
```

```ts [src/app.ts]
/**
 * The bridge already derives one session per channel conversation. This adapter
 * forwards that session into the run's trace options, so Lens groups a
 * conversation into one session instead of unrelated traces.
 */
function withConversationContext(agent: Agent): ChannelAgentExecutor {
  const traceOf = (session?: MemoryScope) =>
    session === undefined
      ? undefined
      : { sessionId: session.sessionId, userId: session.userId, metadata: session.metadata }

  return {
    model: agent.model,
    memory: agent.memory,
    generate: (input) =>
      agent.generate({
        prompt: input.prompt,
        session: input.session,
        abortSignal: input.abortSignal,
        trace: traceOf(input.session),
      }),
    stream: (input): ChannelAgentStream =>
      agent.stream({
        prompt: input.prompt,
        session: input.session,
        abortSignal: input.abortSignal,
        trace: traceOf(input.session),
      }),
    // A resumed run is keyed by its stored continuation and receives no session
    // here, so it continues without conversation session context.
    resume: (continuation, response, settings) =>
      agent.resume(continuation, response, { abortSignal: settings.abortSignal }),
  }
}
```

:::

`withConversationContext()` is the only place that decides how a channel conversation maps to
trace context. Without it, every channel run is an unrelated trace; with it, one conversation is
one Lens session and the sender becomes the trace user.

The durable interaction store matters as soon as a tool needs approval or the agent asks a
question: the paused run survives a restart, so the approval can arrive later. Conversation memory
and paused interactions are different stores — this example keeps both in SQLite.

## 5. Start, reply, and shut down in order

Long-running process: start the bridge, then stop the highest-level owner first.

::: code-group

```ts [src/index.ts]
const config = loadConfig()
const app = await createSupportApp({ config })

await app.service.start()
console.log(`[golden-path] ${config.agent.name} is listening on Discord channel ${config.discord.conversationId}.`)

let stopping = false

async function stop(signal: string): Promise<void> {
  if (stopping) return
  stopping = true
  console.log(`[golden-path] ${signal} received, shutting down.`)

  try {
    await app.shutdown()
  } catch (error) {
    console.error('[golden-path] shutdown failed', error)
    process.exitCode = 1
  }
}

process.once('SIGINT', () => void stop('SIGINT'))
process.once('SIGTERM', () => void stop('SIGTERM'))
```

```ts [src/app.ts]
    shutdown() {
      shutdownPromise ??= (async () => {
        try {
          // The service owns the adapter: stopping it detaches the gateway and
          // drains queued conversation work before the process exits.
          await service.stop()
        } finally {
          ownedInteractionStore?.close()
          await memory.close()
          await lens.close()
        }
      })()
      return shutdownPromise
    },
```

:::

`service.stop()` stops accepting work and drains queued conversations. Closing Lens last means the
final spans of in-flight runs are still exported; `lens.close()` performs that final delivery and
is idempotent.

## 6. Deliver a proactive report

The same application can push a report without receiving anything. A proactive worker only needs a
channel adapter and `sendChannelMessage()`; it never calls `start()`, so it opens no gateway
connection and has no receive loop.

::: code-group

```ts [src/monitor.ts]
const config = loadConfig()
const app = await createSupportApp({ config })

try {
  const report = await app.report()
  const delivered = await app.notify(report)
  console.log(`[monitor] delivered ${delivered.length} message part(s): ${delivered.map((part) => part.id).join(', ')}`)

  // Short-lived processes should make delivery deterministic before exiting.
  await app.lens.flush()
} finally {
  await app.shutdown()
}
```

```ts [src/app.ts]
    async report() {
      const outcome = await agent.generate({
        prompt:
          'Summarize every open order for the operations channel in at most three lines. Include order ids and statuses.',
        trace: {
          name: 'open-orders-report',
          sessionId: 'ops-monitor',
          tags: ['proactive', 'operations'],
          metadata: { trigger: 'manual' },
        },
      })

      if (outcome.type !== 'response') {
        throw new Error(`The report run ended as "${outcome.type}" instead of producing a response.`)
      }

      return outcome.output
    },
```

:::

`sendChannelMessage()` delegates text limits to the adapter and sends long text as ordered parts. A
failure mid-split throws `PartialDeliveryError` carrying the parts already delivered, so record the
message ids you received and make retries idempotent.

## 7. Run it

```sh
cp .env.example .env      # fill in the values
pnpm start
```

Expected startup output:

```text
[golden-path] golden-path-support is listening on Discord channel 123456789012345678.
[golden-path] Press Ctrl+C to stop.
```

Send the bot a direct message, or mention it in the configured channel: *“Where is order A-1042?”*
The bot first sends the placeholder `Checking the order…`, replaces it with streamed text, and then
answers from the tool result — for the seeded data, `Order A-1042 is shipped with DHL, ETA ...`.

Deliver the proactive report:

```sh
pnpm monitor
```

## 8. Find the trace in Lens

Open the project in Lens and select **Traces**, keeping the time range wide enough. Each request
produces one trace:

| Element | Value in this example |
| --- | --- |
| Trace name | `golden-path-support` (the agent name), or `open-orders-report` for the monitor |
| Root span | `agent.golden-path-support` — status, duration, and run-level token usage |
| Children | `model.turn.1`, `model.turn.2` (generation) and `tool.lookup_order` (tool) |
| Session | the channel conversation key, for example `channel:discord:<bot>:<channel>:root` |
| User | `discord:<sender id>` |

Every run from one Discord conversation shares its session id, so Lens groups them under
**Sessions** instead of leaving them as unrelated traces. The proactive report uses the explicit
`ops-monitor` session from its `trace` options.

Because this application uses safe capture, the input and output panels stay empty by design. You
still see which model ran, how long each turn took, whether the tool call succeeded, and how many
tokens the run consumed. If a trace never appears, confirm that `ANVIA_LENS_BASE_URL` is the Lens
origin with no extra path, that both keys come from the same project, and that the process logged
no exporter errors before it exited.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Startup fails listing missing variables | Fill every value in `.env`; blank counts as missing. |
| Bot is online but never answers | Message Content Intent must be enabled; the default filter handles direct messages and messages that mention the bot. |
| Replies go to the wrong place | `DISCORD_CHANNEL_ID` is the numeric channel id; a thread or DM reports a different conversation id. |
| `lookup_order` is never called | The instruction and tool description must make the tool worth calling; check the model, not the bridge. |
| No trace in Lens | Origin must be the Lens browser origin, keys must match the project, and short-lived processes must reach `lens.close()`/`flush()`. |
| Trace exists but payloads are empty | That is `captureMode: 'safe'`. Full capture is an explicit, reviewed change. |
| `node:sqlite` errors | Node.js 24 or newer, and a writable `data/` directory. |
| Approval never resumes after a restart | The interaction store must be the durable one, and retried resumes are not exactly-once — keep externally mutating tools idempotent. |

## Production checklist

- [ ] Store the Discord token, provider key, and Lens key pair in a deployment secret manager, and
      rotate them; never commit a filled `.env`.
- [ ] Pin compatible `@anvia/*` versions and test upgrades in staging before production.
- [ ] Create one Lens client per process and close it in the graceful shutdown path, after the
      bridge stops accepting work.
- [ ] Keep safe capture until access, redaction, retention, and deletion are approved; lower
      `captureMaxBytes` and add application redaction patterns if you enable full capture.
- [ ] Use stable opaque user and session identifiers; treat telemetry as operational data, not as
      authentication, authorization, or a business record.
- [ ] Decide the conversation scope deliberately: per-sender history is the default, shared group
      history is an explicit choice.
- [ ] Alert on exporter failures independently of agent availability.
- [ ] Run the example's smoke test in CI so the wiring stays verified without production
      credentials.

## How the example is validated

```sh
cd examples/golden-path
pnpm test
```

The smoke test replaces the three external systems with in-process doubles — a scripted
OpenAI-compatible endpoint, a fake `DiscordGateway`, and a local OTLP receiver — then asserts the
behavior a user would see:

1. an inbound Discord message reaches the agent, the typed tool runs, and the answer is delivered
   back through the adapter;
2. the proactive report is delivered without starting the bridge;
3. the exported trace contains the `agent.*`, `model.turn.*`, and `tool.*` spans in one trace,
   with the conversation session, the sender as user, and token usage;
4. safe capture keeps prompts, tool arguments, and tool results out of the payload.

Because the gateway is an injected `DiscordGateway`, the test drives the real adapter and bridge
code, not a mock of them. The same seam is available in production for applications that already
own a Discord connection — see [Custom Discord gateway](/channels/discord/gateway).

What the smoke test does not cover: real Discord permissions, real provider responses, and Lens
ingestion. Verify those once per environment by sending one message and opening the resulting
trace, as described above.

## Where to go next

- [Build a channel application end to end](/channels/end-to-end) — every bridge option, attachment
  policy, and shutdown rule.
- [Channel-agent bridge](/channels/channel-agent) — filtering, prompts, streaming, interactions.
- [Trace an Anvia agent with Lens](/examples/production/tracing-with-lens) — observer lifecycle,
  capture policy, and exporter failure handling.
- [Your first trace](/lens/your-first-trace) — trace context fields and how Lens groups runs.
- [Persistent memory](/sdk/memory) — memory stores, save policies, and compaction.
- [Testing agents](/examples/production/testing-agents) — deterministic tools, fake models, and
  regression protection.
