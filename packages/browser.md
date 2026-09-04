# `@anvia/browser`

`@anvia/browser` gives Anvia agents an application-owned, visible Chromium runtime. It combines an explicit Docker browser lifecycle, per-capability readiness, an isolated Playwright connection with bounded action scheduling, semantic browser tools, a noVNC desktop, and coordinated human takeover.

## Install

```bash
pnpm add @anvia/browser @anvia/core @anvia/sandbox
```

The package requires Node.js 20.12 or newer, Docker, and an application-selected Anvia browser image. `@anvia/sandbox` owns Docker infrastructure; `@anvia/browser` owns the Chromium workload, capability readiness, connection scheduling, and control arbitration inside it.

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

// Wait only for the capabilities this workflow requires.
await browser.waitForCapabilities({
  capabilities: ['automation', 'desktop'],
  timeoutMs: 30_000,
})
await using connection = await browser.connect({
  timeoutMs: 30_000,
  scheduling: { mode: 'per-tab', maxConcurrentTabs: 8, maxQueuedActions: 1_000 },
})

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

Construction performs no I/O. Image acquisition, browser creation, readiness, CDP connection, and cleanup are separate bounded operations. The browser owns its sandbox; each connection owns only its automation worker and CDP connection, and disconnecting it never destroys Chromium.

## Capability readiness

Readiness is per capability — `runtime`, `browser`, `automation`, and `desktop` — not all-or-nothing. `browser.readiness()` is synchronous and reports a `BrowserReadinessSnapshot` without probing: each capability carries an `unknown`, `checking`, `ready`, `failed`, `stopped`, or `destroyed` state, while the overall snapshot can be `partial` (some capabilities ready, others unchecked) or `degraded` (a checked capability failed while another remains usable). `waitForCapabilities({ capabilities, timeoutMs, abortSignal })` waits only for the capabilities a workflow requires and resolves with a fresh snapshot. `waitUntilReady({ timeoutMs })` survives as a thin wrapper that waits for all four capabilities.

Desktop probing never establishes Playwright, so a failed `automation` probe can leave `desktop` ready and the snapshot degraded. Preserve healthy capabilities while the failed one is retried or restarted.

## One connection, scheduled actions

A `DockerBrowser` handle allows one active or pending automation connection; a second `connect()` rejects with `agent_action_busy`. Share that connection among agents that use the same browser and disconnect it before reconnecting, so one resource scheduler and navigation policy arbitrate the shared Chromium context.

`connect({ scheduling })` defaults to serial scheduling, the compatibility mode: every tool call runs in one bounded FIFO queue against the selected tab. Opt into independent-tab concurrency with `{ mode: 'per-tab', maxConcurrentTabs, maxQueuedActions }`, and pass an explicit `tabId` to `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_press_key`, and `browser_screenshot`. Calls that omit `tabId` keep the selected-tab behavior. Obtain stable IDs from `browser_list_tabs` or `browser_open_tab`; IDs are scoped to one connection, so list tabs again after reconnecting.

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
