# Remote tunnels

A tunnel is a raw TCP connection from the control plane to a service listening on the sandbox's own loopback: a development server, a database, or a VNC server. The sandbox needs no inbound port and no published address. The bytes ride the daemon's existing WebSocket.

Tunnels are a separate capability, not part of `SandboxRuntime`, and only the remote runtime provides them.

## Open a tunnel

```ts
const tunnel = hub.tunnel('sandbox-1')
const handle = await tunnel.open(5432) // tries 127.0.0.1, then ::1

await handle.write(new TextEncoder().encode('PING\n'))
for await (const chunk of handle.output) {
  console.log(new TextDecoder().decode(chunk))
}
console.log(await handle.exit) // { reason: 'remote' }
```

`open(port, { host })` accepts only `127.0.0.1` and `::1`. Omit `host` to try both, in that order. Any other host is a `TypeError` in the hub, and the daemon's frame validation rejects it as well, so a tunnel can never reach another machine or the sandbox's external interfaces.

The port must be an integer from 1 to 65535. A port nothing listens on fails with the `port` error code. `open()` waits for a disconnected daemon like any other call, then fails with `sandbox_unavailable`; it times out after 15 seconds waiting for the daemon to confirm the connection.

## Handle behavior and exit reasons

| Member | Behavior |
| --- | --- |
| `write(data)` | Sends a string or `Uint8Array`. Settles once there is room; while the service is slow to read, writes wait instead of piling up. Rejects once the tunnel has ended. |
| `output` | Ordered `Uint8Array` chunks. Read it once; a slow reader slows the service rather than growing memory. |
| `close()` | Closes the tunnel. |
| `exit` | Settles with `{ reason }`. It never rejects. |

`exit.reason` is one of:

| Reason | Meaning |
| --- | --- |
| `remote` | The service closed the connection. |
| `closed` | `close()` was called. |
| `error` | The tunnel was cut off, for example by a consumer that fell behind. |
| `disconnected` | The daemon link dropped. |

A tunnel is bound to one daemon connection and is not retried across a reconnect. Reopen it after the daemon returns.

## Daemon restrictions

By default a daemon allows tunnels to any loopback port. Restrict them in `SandboxDaemon` options:

```ts
import { SandboxDaemon } from '@anvia/sandbox/daemon'

const daemon = new SandboxDaemon({
  controlUrl: process.env.ANVIA_CONTROL_URL!,
  token: process.env.ANVIA_SANDBOX_TOKEN!,
  workdir: '/workspace',
  stateDir: '/var/lib/anvia-sandbox',
  tunnel: { allowedPorts: [3000, 5900], maxTunnels: 4 },
})
```

- `allowedPorts` limits the ports a tunnel may reach. Other ports fail with the `port` error code. The desktop's VNC port is always allowed, even when the list omits it.
- `maxTunnels` bounds how many tunnels one hub connection may hold open. The default is 64; opening another fails with `invalid_state`.
- `connectTimeoutMs` sets how long the daemon waits for the local service to accept. The default is 5 seconds.
- `tunnel: false` switches tunnels off. The daemon does not advertise `tunnel`, and a hub gets the `unsupported` error code.

## Flow control

Tunnels share the daemon link with `exec` calls, terminals, and heartbeats. They use terminal-style flow control for output and a write window in the other direction. Output is batched, numbered, and acknowledged as the reader consumes it. The daemon stops reading from a service once 256 KiB are unacknowledged, so a reader that is slow or has stopped never makes the daemon buffer more. `handle.write()` works the same way in reverse: it waits while 256 KiB are unconsumed by the service, so an upload to a slow service does not pile up in memory. A handle that falls `maxTunnelBufferBytes` (1 MiB by default) behind is cut off with `error`.

Those limits suit terminals. A window can carry at most its own size per round trip, so 256 KiB over a 100 ms link is about 2.6 MB/s however fast the service is.

### Interactive profile

For a stream a person is watching, pass `profile: 'interactive'` to `open()`. It sends frames at once, 64 KiB at a time, with a 2 MiB window and a 4 MiB socket buffer, and sizes the hub's buffer, write window (1 MiB), and acknowledgement step (128 KiB) to match. That is about 20 MB/s over a 100 ms link.

```ts
const viewer = await hub.tunnel('sandbox-1').open(5900, {
  host: '127.0.0.1',
  profile: 'interactive',
})
```

`desktop.openViewer()` asks for this profile. The profile travels as an optional string in `tunnel.open`; a daemon that applied it echoes the name in `tunnel.opened`. A daemon that predates the profile, or does not know the name, uses its defaults, and the hub keeps its default write window and acknowledgement step until the daemon confirms, so mixed versions never exceed what the daemon allows.

On the daemon, `tunnel.flowByPort` sets limits for one port. It wins over the requested profile, which wins over `tunnel.flow`:

```ts
tunnel: {
  flowByPort: {
    5900: {
      highWaterBytes: 2 * 1024 * 1024,
      frameBytes: 64 * 1024,
      batchMs: 0,
    },
  },
},
```

## Browser tunnels

`hub.handleTunnelUpgrade(request, socket, head)` relays a browser's WebSocket to a tunnel byte for byte, in binary frames, which is the framing noVNC and websockify use. Give the hub an `authorizeTunnel` function that returns the sandbox and port a ticket grants, and, behind a proxy, `allowedOrigins`.

Tickets and the Origin check work exactly as they do for [browser terminals](/sdk/advanced/sandbox/terminals#browser-relay): `relayTicket(request)` reads the ticket from the `anvia.ticket.<ticket>` subprotocol or `?ticket=`, a foreign Origin gets 403 before the authorizer runs, and a missing or refused ticket gets 401. `terminalTicket` is the same function under its earlier name.

```ts
import { RemoteSandboxHub, relayTicket } from '@anvia/sandbox/remote'

const daemonTokens = new Map([[process.env.DAEMON_TOKEN!, 'sandbox-1']])
const tickets = new Map<string, { sandboxId: string; port: number; expires: number }>()

const hub = new RemoteSandboxHub({
  authorize: (token) => {
    const sandboxId = daemonTokens.get(token)
    return sandboxId === undefined ? null : { sandboxId }
  },
  allowedOrigins: ['https://app.example.com'],
  async authorizeTunnel(request) {
    const ticket = relayTicket(request)
    const grant = ticket === undefined ? undefined : tickets.get(ticket)
    if (ticket !== undefined) tickets.delete(ticket) // single use
    return grant !== undefined && grant.expires > Date.now() ? grant : null
  },
})

await hub.listen({ port: 8787, path: '/daemon', tunnelPath: '/tunnel' })
```

The browser offers the `anvia.tunnel.v1` or `binary` subprotocol, plus its ticket. If the tunnel cannot be opened, the relay closes the socket with code 1011 and a reason that starts with the error code, such as `port: ...` or `unsupported: ...`. A normal `remote` or `closed` exit closes with code 1000.

A browser that sends faster than the service reads is paused until the service catches up.

### Runtimes whose WebSocket cannot pause

The relay pauses a browser's socket with `ws.pause()` and resumes it with `ws.resume()`. Bun replaces the `ws` package with its own WebSocket, which has neither, so on such a runtime the relay asks once and does without. It cannot slow the sender, so it bounds the queue instead: a browser with more than 4 MiB waiting to reach the service (a viewer's largest clipboard message is 1 MiB) is closed with code 1008 and the reason `sending faster than the service reads`.

Where Bun itself stops reading from a socket first, as it does on Linux after a few MB, its own backpressure is the bound and the browser stays open. Everything else the relays use (ping and pong, `terminate`, `close`, the send callback, and `handleUpgrade`) works on Bun, so the browser relays, the VNC stream, and terminals run there.

## What is not included

Preview URLs and domain routing for tunnelled services, tunnels to hosts other than the sandbox's loopback, and UDP are out of scope. A tunnel is a connection you open on demand, not a published address. HTTP awareness, TLS termination, and multiplexing are also left to the application or its proxy.

Tunnel authorization, ticket issuance and redemption, tenant isolation, TLS, and daemon port restrictions remain application responsibilities. Anyone who can run commands inside the sandbox can also connect to its loopback services directly, so a tunnel is not a boundary against code already running there.

See the [package API reference](/packages/sandbox/api-reference) for the exported tunnel types and relay helpers.