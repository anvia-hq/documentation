# Remote terminals

A remote sandbox can offer interactive terminals: a person or your own code attaches to a named session, types, resizes, and reattaches later with the scrollback intact. Terminals are a separate capability, not part of `SandboxRuntime`, and only the remote runtime provides them.

## Open, list, and kill

```ts
const terminal = hub.terminal('sandbox-1')
const handle = await terminal.open({ sessionName: 'main', cols: 120, rows: 30 })

handle.write('npm test\n')
for await (const chunk of handle.output) process.stdout.write(chunk)

console.log(await handle.exit) // { reason: 'exited', exitCode: 0 }

const sessions = await terminal.list()
// [{ name: 'main', attached: 1, persistent: true, createdAt: '...' }]
await terminal.kill('main')
```

`open()` attaches to the session named `sessionName`, creating it in the workdir if needed. `cwd` is relative to the workdir and is used only when the session is created; `env` works the same way. Session names use letters, digits, `_`, and `-`, up to 64 characters. `cols` and `rows` are integers from 1 to 1000.

Several handles can attach to one session and all see the same output. `close()` detaches; the session keeps running until `kill()` or until the sandbox stops. Read `output` once. `exit` never rejects. Handles implement `Disposable`, so `using handle = await terminal.open(...)` closes the handle on scope exit.

Opening a terminal waits for a disconnected daemon like any other call, then fails with `sandbox_unavailable`. A terminal is bound to one daemon connection, so it is never retried across a reconnect.

## Handle behavior

| Member | Behavior |
| --- | --- |
| `write(data)` | Sends a string or `Uint8Array`. Input is ignored once the terminal has ended. |
| `resize(cols, rows)` | Changes the viewer's size. With tmux, the shared session uses its most recent viewer's size. |
| `close()` | Detaches this viewer. A tmux session keeps running. |
| `output` | Ordered `AsyncIterable<Uint8Array>`. A slow reader slows the daemon rather than growing memory. |
| `exit` | Settles with `{ reason, exitCode? }`. It never rejects. |

`exit.reason` is one of:

| Reason | Meaning |
| --- | --- |
| `exited` | The shell or tmux client ended. |
| `closed` | `close()` was called. |
| `killed` | The session was ended with `terminal.kill()`. |
| `error` | The terminal was cut off, for example by a consumer that fell behind. |
| `disconnected` | The daemon link dropped. A tmux session itself is unaffected, so reopen it after the daemon returns. |

## Image requirements and persistence

The daemon offers terminals only when it can load [`node-pty`](https://github.com/microsoft/node-pty). It is an optional peer dependency, so Docker-only applications never install native code. Add it to the daemon's image yourself. On Linux it builds from source and needs `python3`, `make`, and `g++` at install time.

```dockerfile
FROM node:22-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends tmux python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g @anvia/sandbox node-pty
ENV NODE_PATH=/usr/local/lib/node_modules
CMD ["anvia-sandbox-daemon"]
```

With **tmux 3.2 or newer** on `PATH`, a session is a tmux session on a private socket. Every viewer is its own `tmux attach`, so sessions persist across hub disconnects and daemon restarts, and reattaching redraws the screen. The daemon sets `window-size latest` so viewers of different sizes share one session, and read-only viewers attach with `read-only,ignore-size`. Splits, windows, and tmux key bindings work normally.

Without tmux, the daemon falls back to one plain shell per session with a bounded scrollback ring (`scrollbackBytes`, 256 KiB by default). That session survives hub disconnects but **not a daemon restart**, and `list()` reports it with `persistent: false`.

Set `ANVIA_SANDBOX_TERMINAL=0` to switch terminals off, or pass `terminal: false` to `SandboxDaemon`. The daemon defaults to 16 sessions and 16 attached terminals per hub connection; `terminal: { maxSessions, maxAttachments }` changes those limits.

The daemon advertises terminals in `hello` and the hub in `welcome`. A hub never sends a terminal frame to a daemon that did not advertise `terminal`: `open()`, `list()`, and `kill()` fail with the `unsupported` error code, and the rest of the link is unaffected. The same happens when the image lacks `node-pty`.

## Flow control

Terminal output cannot starve `exec` calls or heartbeats on the shared socket. The daemon batches output for about 10 ms into frames of at most 16 KiB, numbered per terminal. The consumer acknowledges bytes as it reads them, and once 256 KiB are unacknowledged the daemon stops that terminal:

- with tmux, it pauses the attach PTY, and tmux skips ahead for a slow client;
- in the fallback, it drops the backlog and sends a reset plus a snapshot once the viewer catches up.

The daemon also holds output back while the socket's send buffer is full. A handle that falls `maxTerminalBufferBytes` (1 MiB by default) behind is cut off with `error`. A stalled viewer therefore slows only itself.

## Browser relay

`hub.handleTerminalUpgrade(request, socket, head)` accepts a browser's WebSocket and relays it to a terminal. It is separate from the daemon upgrade path. The hub needs an `authorizeTerminal` function; behind a proxy, also set `allowedOrigins`.

Browsers cannot send an `Authorization` header on a WebSocket, and a long-lived credential in a URL would leak into logs. The ticket flow is:

1. The signed-in user asks your backend for access to a sandbox session.
2. Your backend checks permissions and mints a short-lived, single-use ticket bound to `{ sandboxId, sessionName, readOnly }`.
3. The browser opens the WebSocket offering the subprotocols `anvia.terminal.v1` and `anvia.ticket.<ticket>` (or, less ideally, `?ticket=<ticket>`).
4. `authorizeTerminal` redeems the ticket. A missing or refused ticket gets HTTP 401.

```ts
import { RemoteSandboxHub, terminalTicket } from '@anvia/sandbox/remote'

const hub = new RemoteSandboxHub({
  authorize: (token) => lookupDaemonToken(token), // application-owned
  allowedOrigins: ['https://app.example.com'],
  authorizeTerminal(request) {
    const ticket = terminalTicket(request)
    const grant = ticket === undefined ? undefined : redeemTerminalTicket(ticket)
    return grant ?? null
  },
})
await hub.listen({ port: 8787, path: '/daemon', terminalPath: '/terminal' })
```

`terminalTicket(request)` reads the ticket from the `anvia.ticket.<ticket>` WebSocket subprotocol or the `ticket` query parameter. Prefer the subprotocol: URLs end up in access logs. `redeemTerminalTicket` is application code. `createRelayTicketStore<Grant>()` from `@anvia/sandbox/remote` provides an in-memory, single-use store you can use for it: `store.mint(grant, { ttlMs })` returns a URL-safe ticket (default TTL 30 seconds, at most 10,000 unredeemed entries) and `store.redeemRequest(request)` reads the ticket from an upgrade request and consumes it once, returning the grant or `null`. It is per-process, so multi-node deployments need a shared store. Whichever store you use, check that the ticket exists, has not expired, has not been used, and that the signed-in user may access that sandbox and session.

The hub checks `Origin` before it calls `authorizeTerminal`: it must be in `allowedOrigins`, or, with no list, match the `Host` the browser connected to. Anything else gets 403. Requests with no `Origin` (not a browser page) pass this check and still need a ticket.

Over the socket, the browser's first message must be `{ "type": "open", "cols": 80, "rows": 24 }`, followed by `{ "type": "input", "data": "ls\n" }` and `{ "type": "resize", "cols": 100, "rows": 30 }`. Terminal output comes back as binary frames; `{ "type": "ready" | "exit" | "error" }` arrive as text. A `readOnly` grant receives output only: the relay drops its input and resize messages, and the daemon also attaches it read-only.

If you route upgrades yourself, call `hub.handleTerminalUpgrade()` for the terminal path and `hub.handleUpgrade()` for the daemon path. `hub.listen({ terminalPath })` does that routing for you.

## End to end

**1. The control plane** runs the hub and mints tickets for signed-in users:

```ts
import { randomBytes } from 'node:crypto'
import { RemoteSandboxHub, terminalTicket } from '@anvia/sandbox/remote'

const daemonTokens = new Map([[process.env.DAEMON_TOKEN!, 'sandbox-1']])
const tickets = new Map<
  string,
  { sandboxId: string; sessionName: string; readOnly: boolean; expires: number }
>()

/** Call this from an authenticated route after checking the user may open this session. */
export function mintTerminalTicket(grant: {
  sandboxId: string
  sessionName: string
  readOnly: boolean
}) {
  const ticket = randomBytes(24).toString('base64url') // URL-safe, so it can ride as a subprotocol
  tickets.set(ticket, { ...grant, expires: Date.now() + 30_000 })
  return ticket
}

const hub = new RemoteSandboxHub({
  authorize: (token) => {
    const sandboxId = daemonTokens.get(token)
    return sandboxId === undefined ? null : { sandboxId }
  },
  allowedOrigins: ['http://localhost:5173'],
  authorizeTerminal(request) {
    const ticket = terminalTicket(request)
    const grant = ticket === undefined ? undefined : tickets.get(ticket)
    if (ticket !== undefined) tickets.delete(ticket) // single use
    return grant !== undefined && grant.expires > Date.now() ? grant : null
  },
})

await hub.listen({ port: 8787, path: '/daemon', terminalPath: '/terminal' })
```

**2. The sandbox** uses the image above, started with the daemon's credentials. Use `wss://` outside local development:

```sh
docker build -t my-sandbox .
docker run --rm \
  -e ANVIA_CONTROL_URL=ws://host.docker.internal:8787/daemon \
  -e ANVIA_SANDBOX_TOKEN="$DAEMON_TOKEN" \
  my-sandbox
```

**3. The browser** renders `SandboxTerminal` from `@anvia/react/sandbox-terminal` and asks your backend for a ticket on every connection:

```tsx
import '@xterm/xterm/css/xterm.css'
import { SandboxTerminal } from '@anvia/react/sandbox-terminal'

export function TerminalPanel() {
  return (
    <div style={{ height: 420 }}>
      <SandboxTerminal
        url="ws://localhost:8787/terminal"
        ticket={async () => (await fetch('/api/terminal-ticket', { method: 'POST' })).text()}
      />
    </div>
  )
}
```

See the [primitives API reference](/packages/react/primitives-api-reference) for the component's props and status handling.

## What is not included

Agent-facing terminal tools (such as capturing a pane), recording and replay, audit logs of terminal input, and terminals for the Docker runtime are out of scope. `DockerSandboxRuntime` does not implement `SandboxTerminal`; `docker exec -it` is the Docker equivalent today.

Terminal access is interactive shell access with the daemon's privileges. Authorization, ticket issuance and redemption, tenant isolation, TLS, network policy, and session auditing remain application responsibilities.