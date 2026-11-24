# Can an agent use a computer or desktop?

Yes, inside a remote sandbox. `@anvia/sandbox` can run a virtual desktop in a sandbox image, and `createDesktopTools()` gives an agent tools to take screenshots, move and click the mouse, drag, scroll, type, and press keys. Chromium or any other program on that desktop can be driven this way.

```ts
import { createDesktopTools } from '@anvia/sandbox'
import { RemoteSandboxHub } from '@anvia/sandbox/remote'

const hub = new RemoteSandboxHub({
  authorize: (token) => (token === 'local-dev-token' ? { sandboxId: 'sbx_123' } : null),
})

const tools = createDesktopTools({
  sandbox: hub.desktop('sbx_123'),
  tools: ['desktop_screenshot', 'desktop_click', 'desktop_type', 'desktop_key'],
})
```

The `authorize` callback is a development placeholder; production code must validate a real sandbox token.

## What does it require?

Desktops belong to the remote runtime: a daemon inside the sandbox connects out to a `RemoteSandboxHub` in your application. The local `DockerSandboxClient` does not provide a desktop. The image needs a VNC display server, `xdotool`, `xrandr`, and ImageMagick; `anvia-sandbox create-image --feature desktop` can generate one.

## Can a person watch or take over?

Yes. Studio can show a remote sandbox's live desktop. While a person holds control, the agent's input tools fail with a `desktop_locked` error.

## Is the desktop a security boundary?

No. Input tools run with the daemon user's privileges inside the sandbox. Isolation comes from the sandbox host, image, network, and credentials your application chooses. The older `@anvia/browser` package is retired.

See [Remote desktop](/sdk/advanced/sandbox/desktop), [remote sandboxes](/sdk/advanced/sandbox/remote), [Studio sandboxes](/studio/sandboxes), and [sandbox security](/sdk/advanced/sandbox/security).
