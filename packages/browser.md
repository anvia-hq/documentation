# `@anvia/browser`

`@anvia/browser` gives Anvia agents an application-owned, visible Chromium runtime. It combines an explicit Docker browser lifecycle, a Playwright connection, semantic browser tools, a noVNC desktop, and coordinated human takeover.

## Install

```bash
pnpm add @anvia/browser@rc @anvia/core@rc @anvia/sandbox@rc
```

The package requires Node.js 20.12 or newer, Docker, and an application-selected Anvia browser image. `@anvia/sandbox` owns Docker infrastructure; `@anvia/browser` owns the Chromium workload inside it.

## Runtime boundary

```ts
import { DockerBrowserClient, createBrowserTools } from '@anvia/browser'
import { DockerSandboxClient } from '@anvia/sandbox'

const client = new DockerBrowserClient({
  sandboxClient: new DockerSandboxClient(),
  image: process.env.ANVIA_BROWSER_IMAGE!,
})

await client.pullImage()
await using browser = await client.createBrowser({
  workspace: { type: 'ephemeral' },
  network: { mode: 'bridge' },
  desktop: {
    protocol: 'novnc',
    password: process.env.ANVIA_BROWSER_VNC_PASSWORD!,
    viewport: { width: 1440, height: 900 },
  },
})

await browser.waitUntilReady({ timeoutMs: 30_000 })
await using connection = await browser.connect()

const tools = createBrowserTools({
  connection,
  tools: [
    'browser_list_tabs',
    'browser_open_tab',
    'browser_select_tab',
    'browser_close_tab',
    'browser_navigate',
    'browser_snapshot',
    'browser_click',
    'browser_type',
    'browser_press_key',
    'browser_screenshot',
  ],
  navigation: { mode: 'origins', origins: ['https://docs.example.com'] },
})
```

Construction performs no I/O. Image acquisition, browser creation, readiness, CDP connection, and cleanup are separate operations. The browser owns its sandbox; the connection owns only CDP and never destroys Chromium.

## What the tools expose

Browser tools use strict Playwright locators and ARIA snapshots. They do not expose arbitrary JavaScript evaluation, raw CDP, coordinate clicks, shell access, hidden retries, or automatic reconnection.

Use the allowlisted tool tuple and navigation policy as product policy, then enforce network isolation separately. Docker bridge networking is not an SSRF boundary.

## Next steps

- [Get started](/packages/browser/get-started)
- [Capabilities](/packages/browser/capabilities)
- [Security](/packages/browser/security)
- [Public API](/packages/browser/api-reference)
- [Visible browser guide](/sdk/advanced/browser)
- [Studio browser desktop](/studio/browser)
