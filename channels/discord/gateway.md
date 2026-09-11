# Custom Discord gateway

Use the `DiscordGateway` interface when an existing application already owns a Discord connection. See [@anvia/discord](/channels/discord) for standard setup.

## Inject a gateway

```ts
import { DiscordChannel } from '@anvia/discord'
import type { DiscordGateway } from '@anvia/discord'

const gateway: DiscordGateway = existingGatewayAdapter
const channel = new DiscordChannel({ gateway })
```

The custom gateway must emit runtime-validated `DiscordGatewayEvent` values, implement the REST operations required by the interface (`send`, `edit`, `delete`, `showTyping`, `react`), and drain in-flight handlers during `stop()`. `DiscordJsGateway` is a reference implementation.

## Shutdown

```ts
await channel.stop()
```

Stopping detaches Gateway listeners, destroys the Discord client, and waits for current event deliveries. It is safe to call after a direct `channel.start()`; if a [channel agent](/channels/channel-agent) owns the adapter, stop the service instead.

## Continue with

- [Receive Discord events](/channels/discord/receiving) — what the gateway delivers.
- [Discord messaging](/channels/discord/messaging) — the REST operations a custom gateway must implement.
