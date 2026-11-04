# Remote desktop

A remote sandbox can expose a virtual display that an agent can see and drive and that a person can watch or take over. Chromium is just one program on that desktop; the API is not browser-specific.

Desktops belong to the [remote runtime](/sdk/advanced/sandbox/remote). Create one with `hub.desktop(sandboxId)` from `@anvia/sandbox/remote`; the local `DockerSandboxClient` runtime does not offer one. The daemon starts the display, inputs, and viewing path inside the sandbox, with the daemon user's privileges. Treat the desktop as an interface inside the sandbox, not as an isolation boundary.

## Look at and drive the desktop

```ts anvia-check
import { RemoteSandboxHub } from '@anvia/sandbox/remote'

const hub = new RemoteSandboxHub({
  authorize: (token) => (token === 'local-dev-token' ? { sandboxId: 'sbx_123' } : null),
})
const desktop = hub.desktop('sbx_123')

await desktop.start()
const shot = await desktop.screenshot({ scale: 0.5 })
await desktop.act({ type: 'click', x: 640, y: 400 })
await desktop.act({ type: 'type', text: 'hello' })
await desktop.act({ type: 'key', keys: 'ctrl+s' })
await desktop.resize(1920, 1080)
```

`status()` reports where the desktop is without starting it. `start()` starts it if needed and waits until it is up. `screenshot()`, `act()`, `resize()`, and `openViewer()` start it on demand too, and callers arriving together share one start.

A status object contains `state` (`stopped`, `starting`, `running`, `restarting`, or `failed`), the current `width` and `height`, `maxWidth` and `maxHeight`, the X `display`, the loopback `vncPort`, the number of `restarts`, an optional `message`, and the current `control` holder.

`screenshot()` returns `{ png, width, height, displayWidth, displayHeight }`. `width` and `height` describe the image; `displayWidth` and `displayHeight` describe the display. Pass a `scale` greater than 0 and at most 1 for a smaller image.

`act()` takes one of these actions:

| Action | Fields |
| --- | --- |
| `mouse_move` | `x`, `y` |
| `click` | `x` and `y` (omit both to click at the cursor), `button` (`left`, `middle`, `right`), `count` (1–3) |
| `drag` | `fromX` and `fromY` (omit both to start at the cursor), `toX`, `toY`, `button` |
| `scroll` | `x` and `y` (optional), `direction` (`up`, `down`, `left`, `right`), `amount` |
| `type` | `text`, optional `delayMs` |
| `key` | `keys`, such as `Return`, `ctrl+s`, or `alt+F4` |

Coordinates in `act()` are pixels of the current display, measured from its top-left corner. A point outside the display, or an `x` without a `y`, fails with a `RangeError` before any input is sent. Inputs run one at a time.

`resize(width, height)` changes the display without closing open windows. The new size must not exceed the daemon's maximum resolution, which defaults to 3840x2160; a larger request fails with a `RangeError`.

`cursorPosition()` returns `{ x, y }` in display pixels. The agent tools below convert that value back to screenshot pixels.

## Retries and idempotency

`act()`, `resize()`, `takeover()`, and `release()` accept an `operationId`, like other mutating remote calls:

```ts
await desktop.act(
  { type: 'click', x: 320, y: 240 },
  { operationId: 'run-42/click-1' },
)
```

The daemon runs each `operationId` once. A retry that arrives while the first attempt is still running joins it; a later retry receives the stored result. Only successful results are stored, so a failed or cancelled call can be retried for real. Reusing an id with different parameters fails with `invalid_state`. The stored table is bounded, so the guarantee covers recent operations rather than all history.

Without an `operationId`, a mutation that loses the link fails with `sandbox_unavailable` instead of being repeated, because it may already have run. Read-only calls such as `status()`, `screenshot()`, `cursorPosition()`, and `control()` are retried after a reconnect.

## Control lock

A person takes over with `takeover({ holder, leaseMs? })`:

```ts
const control = await desktop.takeover({ holder: 'alice', leaseMs: 60_000 })
// { held: true, holder: 'alice', expiresAt: '...' }
await desktop.release({ holder: 'alice' })
```

While a person holds control, the agent's `act()` calls fail with the `desktop_locked` error code, and the error names the holder. `screenshot()`, `cursorPosition()`, `status()`, and everyone's ability to watch keep working. Set the daemon's `lock.waitForReleaseMs` if agent inputs should wait for a release before they fail.

A hold is a lease, 60 seconds by default. The holder renews it by calling `takeover()` again; the browser relay renews while its viewer stays connected. If the holder disappears, the lease expires and the agent can act again, so a closed tab cannot lock it out permanently. Another holder cannot take over, and `release({ holder })` only releases that holder's own hold. Calling `release()` without a holder, or with `force: true`, clears any hold; keep both in operator-only code. The hold lives in the daemon, so it survives a hub restart.

`control()` returns `{ held, holder?, expiresAt? }` without changing anything. The lock coordinates people and the agent; it does not authenticate who the holder is. Authorize takeover in application code.

## Agent tools

`createDesktopTools()` turns a `SandboxDesktop` into Anvia tools:

```ts anvia-check
import { createDesktopTools } from '@anvia/sandbox'
import { RemoteSandboxHub } from '@anvia/sandbox/remote'

const hub = new RemoteSandboxHub({
  authorize: (token) => (token === 'local-dev-token' ? { sandboxId: 'sbx_123' } : null),
})
const tools = createDesktopTools({
  sandbox: hub.desktop('sbx_123'),
  tools: ['desktop_screenshot', 'desktop_click', 'desktop_key'],
  settleMs: 300,
  screenshot: { maxEdge: 1568, maxPixels: 1_150_000 },
})
```

Pass the returned tools to an `Agent` like any other tool list. Omitting it exposes every desktop tool; select only the ones the workflow needs. Unknown names throw a `TypeError`.

| Tool | Arguments | Behaviour |
| --- | --- | --- |
| `desktop_screenshot` | none | Returns the PNG plus its `width` and `height`. |
| `desktop_click` | `coordinate?`, `button?`, `click_count?` | Clicks at a point, or at the cursor when the coordinate is omitted. |
| `desktop_mouse_move` | `coordinate` | Moves the cursor. |
| `desktop_drag` | `start_coordinate?`, `coordinate` | Presses the left button at the start point (or cursor), drags, and releases. |
| `desktop_scroll` | `coordinate?`, `scroll_direction`, `scroll_amount?` | Scrolls up, down, left, or right. `scroll_amount` is wheel clicks, default 3. |
| `desktop_type` | `text` | Types text into the focused window. Click the field first. |
| `desktop_key` | `text` | Presses a key or combination such as `Return`, `Tab`, `ctrl+s`, or `alt+F4`. |
| `desktop_cursor_position` | none | Returns the cursor as `coordinate: [x, y]`. |
| `desktop_wait` | `duration` | Waits 0.1–10 seconds before the next look or input. |

The arguments follow Claude's computer-use conventions: `coordinate: [x, y]`, `start_coordinate`, `text`, `scroll_direction`, and `scroll_amount`.

### Coordinates

Tool coordinates are **pixels of the latest screenshot**, from its top-left corner. The default scale limits match Claude's computer-use image guidance: about 1568 pixels on the long edge and 1.15 megapixels. A model downscales larger images, which would make coordinates drift, so `desktop_screenshot` scales the image to fit those limits first and the input tools translate points back to display pixels, aiming at the centre of the pixel the model pointed at. A display that already fits is not scaled.

Configure the limits with `screenshot: { maxEdge, maxPixels }`. A point outside the screenshot is refused with the valid range before anything happens. A display resized between calls is noticed because each tool reads the current size. `desktop_cursor_position` converts the daemon's display coordinate into the same screenshot space.

### Settling

Each input tool waits `settleMs` after acting before it returns. The default is 300 ms; `0` turns it off. A model can send several inputs in one turn, and a program that is still reacting to one drops keystrokes that arrive too soon: Chromium's address bar loses text typed right after `ctrl+l`. The screenshot, cursor, and wait tools do not wait.

### Recovery

The tools are separate rather than one `computer` tool so durable recovery can treat looking and acting differently. Use `desktopToolRecovery` in a durable registration:

```ts
import { desktopToolRecovery } from '@anvia/sandbox'

const toolRecovery = { ...desktopToolRecovery, exec_command: 'idempotent' } as const
```

Screenshots, the cursor position, and waiting are `safe` to repeat. Every input is `idempotent`, because the run's `operationId` reaches the daemon, which performs each input once even if the call is retried.

While a person holds control, the input tools fail with `desktop_locked` and a message naming the holder, which the model sees as a failed tool call. The screenshot and cursor tools keep working so the agent can watch and wait.

## Image requirements

The daemon advertises the `desktop` capability only when the image has everything it needs. It needs:

- an X server with a VNC server: either **Xvnc** (TigerVNC's `tigervnc-standalone-server`, where the display and VNC server are one process) or **Xvfb with x11vnc**;
- `xdotool` for input;
- `xrandr` for resizing;
- ImageMagick's `import` for screenshots.

The daemon uses Xvnc when it is installed and falls back to Xvfb with x11vnc, so images built for the older pair keep working. `desktop.backend: 'xvnc' | 'xvfb'`, or naming a program in `desktop.binaries`, chooses a backend explicitly.

On Xvnc the daemon also runs `vncconfig -nowin` when it is installed, which is what syncs the clipboard with desktop programs. A window manager is optional: `openbox-session` is used when installed, then `openbox`, and the desktop runs without one if neither is found, leaving windows without frames. Use `windowManager: false` to run without one.

If the programs are missing, the daemon logs why and does not advertise the capability. A desktop call against such a sandbox fails with `unsupported`.

### Reference image

The [reference image](https://github.com/anvia-hq/anvia/blob/main/packages/tool-sandbox/images/desktop/Dockerfile) includes Xvnc, openbox, a small themed dock and compositor, Chromium, tmux, `node-pty`, fonts, and the daemon:

```sh
docker build -t my-desktop-sandbox packages/tool-sandbox/images/desktop
docker run --rm -e ANVIA_CONTROL_URL=wss://hub.example.com/daemon \
  -e ANVIA_SANDBOX_TOKEN=... my-desktop-sandbox
```

Inside it, `anvia-chromium` starts Chromium on the desktop. Chromium's own sandbox needs user namespaces, which Docker's default seccomp profile blocks, so the launcher starts it with `--no-sandbox`: the container is already the deployment's isolation boundary. Set `ANVIA_CHROMIUM_SANDBOX=1` to keep Chromium's sandbox, and run the container with a seccomp profile that allows user namespaces or with `--cap-add SYS_ADMIN`.

For another base image, install the same packages: `tigervnc-standalone-server xdotool imagemagick x11-xserver-utils` (or `xvfb` with `x11vnc` for the fallback), plus `openbox` if you want a window manager.

### Generated desktop image

`create-image --feature desktop` generates an image for you:

```sh
pnpm dlx @anvia/sandbox create-image --name desk --feature desktop --apt chromium
docker run --rm anvia-sandbox-desk:latest \
  /opt/anvia-daemon/node_modules/.bin/anvia-sandbox-daemon --check --require=desktop
docker run --rm -e ANVIA_CONTROL_URL=wss://hub.example.com/daemon \
  -e ANVIA_SANDBOX_TOKEN=... anvia-sandbox-desk:latest
```

The feature adds Node.js and writes a Dockerfile that installs Xvnc, openbox, xdotool, ImageMagick, xterm, tmux, and `@anvia/sandbox` at the generating CLI's version with `node-pty`, then runs `anvia-sandbox-daemon` as a non-root `sandbox` user. Add your own programs with `--apt`. It cannot be combined with `playwright`.

The generated image starts the daemon, so it is for the remote runtime, not for `DockerSandboxClient`. It builds on Debian bookworm, where `chromium` installs as a real package. Unlike the reference image it has no launcher that adds `--no-sandbox`, so a browser in the container needs either that flag or a container configuration that allows user namespaces.

## Daemon configuration

The `anvia-sandbox-daemon` CLI reads desktop settings from the environment, so an image needs no entrypoint of its own to change them. `ANVIA_CONTROL_URL` and `ANVIA_SANDBOX_TOKEN` are required; `ANVIA_SANDBOX_WORKDIR` and `ANVIA_SANDBOX_STATE_DIR` select the workspace and operation table.

| Variable | Effect |
| --- | --- |
| `ANVIA_SANDBOX_DESKTOP=0` | Turns the desktop off. |
| `ANVIA_SANDBOX_DESKTOP_BACKEND` | `auto` (default), `xvnc`, or `xvfb`. |
| `ANVIA_SANDBOX_DESKTOP_RESOLUTION` | Starting size, like `1440x900`; default 1280x800. |
| `ANVIA_SANDBOX_DESKTOP_MAX_RESOLUTION` | Largest size a resize may ask for; default 3840x2160. |
| `ANVIA_SANDBOX_DESKTOP_DISPLAY` | X display, like `:99`. |
| `ANVIA_SANDBOX_DESKTOP_VNC_PORT` | Loopback VNC port; default 5900. |
| `ANVIA_SANDBOX_DESKTOP_WINDOW_MANAGER` | Window manager command, or `none`; default `openbox-session`, then `openbox`. |

A malformed value stops the daemon at startup instead of falling back to a default. The `lock` settings have no environment variables; set them through `desktop: { lock: { ... } }` when embedding `SandboxDaemon` from `@anvia/sandbox/daemon`.

Use `--check` to see what an image offers without connecting to a hub. It prints the capabilities and what is missing, and needs no URL or token. `--require=desktop` makes it exit 1 when the desktop is unavailable; `terminal` and `desktop` can be combined, comma-separated. This suits a Dockerfile `RUN` step or a health check.

## Supervision and resizing

Nothing graphical runs until the desktop is first used. The daemon supervises the X server and VNC server, the window manager, and on Xvnc `vncconfig`. A crashed piece is restarted with exponential backoff: 500 ms initially, doubling to 10 seconds. The X server takes the others down with it, since they hold its display, and comes back at the size it was left at.

A call that arrives while the desktop is restarting waits for it. If the display crashes under a command, the daemon restarts it and repeats that command once. After too many quick failures in a row (`desktop.restart.maxFailures`, default 5) it gives up, `status()` reports `failed` with the reason, and the next call tries again. A desktop that stayed up for 30 seconds resets the failure count.

The display starts at 1280x800. Larger sizes cost CPU and bandwidth; 1440x900 is a sensible ceiling for smoothness. `resize()` can grow or shrink it up to `desktop.maxResolution`. Xvfb starts at the maximum size and is shrunk, while Xvnc starts at `resolution` and grows.

## View in a browser

The daemon's VNC server listens on `127.0.0.1` with no password, so the only route to it is a [tunnel](/sdk/advanced/sandbox/tunnels). The daemon always allows its VNC port through, even when tunnel ports are restricted. `desktop.openViewer()` starts the desktop and opens that tunnel, returning a byte handle for a VNC viewer. Nothing like websockify runs in the sandbox.

For a browser, route upgrades to `handleDesktopUpgrade` and authorize them:

```ts anvia-check
import { RemoteSandboxHub, relayTicket } from '@anvia/sandbox/remote'

// Application-owned: validate a short-lived ticket and return its grant.
declare function redeemTicket(ticket: string | undefined):
  | { sandboxId: string; readOnly?: boolean; userId: string }
  | undefined

const daemonToken = process.env.ANVIA_SANDBOX_TOKEN ?? ''

const hub = new RemoteSandboxHub({
  authorize: (token) => (token === daemonToken ? { sandboxId: 'sbx_123' } : null),
  allowedOrigins: ['https://app.example.com'],
  authorizeDesktop: (request) => {
    const grant = redeemTicket(relayTicket(request))
    return grant === undefined
      ? null
      : { sandboxId: grant.sandboxId, readOnly: grant.readOnly, holder: grant.userId }
  },
})
await hub.listen({ port: 8787, path: '/daemon', desktopPath: '/desktop' })
```

The browser offers the `anvia.desktop.v1` subprotocol, or `binary`. `relayTicket(request)` reads the ticket from the `anvia.ticket.<ticket>` subprotocol entry or the `ticket` query parameter. Prefer the subprotocol: URLs end up in access logs. `authorizeDesktop` returns `{ sandboxId, readOnly?, holder? }`, or `null` to refuse with 401.

Origin checks are the same as for browser terminals. Without `allowedOrigins`, a browser's Origin must match the Host it connected to; set the list when a proxy rewrites Host. A bad Origin gets 403 before the authorizer runs, so a foreign page cannot spend a ticket.

Binary frames carry the VNC stream. The relay reads the client half and removes the messages that would drive the desktop — keys, pointer, clipboard, and resize requests — for a `readOnly` viewer and, while someone holds control, for any viewer who is not the holder. A read-only viewer cannot type even with a modified client. Anything the relay cannot account for closes the connection.

Text frames are a small JSON control channel. The browser sends `{ "type": "takeover" }` or `{ "type": "release" }`; the relay answers with `{ "type": "control", held, holder, expiresAt, you, readOnly }` whenever control changes, and `{ "type": "error", code, message }` when a request fails. The relay renews its viewer's hold while connected and releases it on disconnect.

Anyone who can run commands inside the sandbox can also connect to the VNC port directly. That is the same access the sandbox already gives them, but it means the desktop is not a boundary against code running in the sandbox.

## Studio

`studioSandbox` from `@anvia/sandbox/remote` returns the registration Studio's `sandboxes` option takes for a remote sandbox: a read-only inspector for files, processes, and logs, plus a live desktop view. Studio and the hub must run in the same process, because the desktop is streamed through the hub's link.

```ts anvia-check
import { createDesktopTools } from '@anvia/sandbox'
import { RemoteSandboxHub, studioSandbox } from '@anvia/sandbox/remote'
import { Studio } from '@anvia/studio'

declare const agent: import('@anvia/core/agent').Agent

const hub = new RemoteSandboxHub({
  authorize: (token) => (token === 'local-dev-token' ? { sandboxId: 'sbx_123' } : null),
})
const tools = createDesktopTools({ sandbox: hub.desktop('sbx_123') })

const studio = new Studio([agent], {
  sandboxes: [
    studioSandbox(hub, 'sbx_123', {
      agentIds: [agent.id],
      toolNames: tools.map((tool) => tool.name),
    }),
  ],
})
```

When the agent calls one of `toolNames`, the Playground opens a desktop panel. The panel is view-only until a person explicitly takes control. While they hold it, their input reaches the desktop and the agent's desktop tools fail with `desktop_locked` until they release control or stop renewing. Closing the panel does not forget the desktop.

Pass `desktop: false` to register the inspector alone, or `desktop: { id, label }` to name the view. `studioDesktopView(hub.desktop(id))` gives just the view. The view is registered with local access and no authentication, so keep Studio on localhost or behind your own access control. See [Studio sandboxes](/studio/sandboxes).

## Not included

- Audio capture or playback.
- A clipboard guarantee. Xvnc with `vncconfig` syncs the clipboard, but there are no agent clipboard tools and the relay filters clipboard messages from viewers who cannot type. Do not put secrets on the desktop clipboard.
- Persistence. The daemon owns the display's processes and stops them on shutdown; desktop state and running graphical programs are not persisted across a daemon or sandbox restart. Persist files through the workspace instead.
- Wayland and WebRTC streaming, CDP-based browser automation, preview URLs and domain routing, and desktops for the local Docker runtime.