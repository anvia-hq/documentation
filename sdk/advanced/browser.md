# Visible browser agents

Use `@anvia/browser` when an agent must operate a real Chromium session that a developer or authorized operator can watch. The application owns the image, network, browser lifetime, selected tools, navigation policy, and any human takeover.

## Recommended lifecycle

1. Construct `DockerSandboxClient` and `DockerBrowserClient` without I/O.
2. Pull or otherwise provision a pinned browser image explicitly.
3. Create one browser for one bounded application task.
4. Wait for the capabilities the task needs, then open a CDP connection.
5. Create only the semantic tools the task needs.
6. Register the agent and optional Studio desktop view.
7. Disconnect and destroy the browser in application-owned cleanup.

Have the agent call `browser_snapshot` before clicking or typing. Prefer role, label, or test-ID targets over CSS. Add tab tools only when multi-tab work is expected.

## Capability readiness

Readiness is per capability: `runtime`, `browser`, `automation`, and `desktop`. Wait only for what the task needs:

```ts
await browser.waitForCapabilities({
  capabilities: ['automation', 'desktop'],
  timeoutMs: 30_000,
})
```

`waitForCapabilities()` accepts `{ capabilities, timeoutMs, abortSignal }`. `readiness()` is synchronous and reports each capability's state (`unknown`, `checking`, `ready`, `failed`, `stopped`, `destroyed`) without probing. Treat readiness as data, not an all-or-nothing gate: a snapshot can be `partial` while capabilities are still unproven, or `degraded` when one failed but another remains usable. Read `BrowserError.capability` to see which capability a readiness failure belongs to.

## Scheduling and errors

`connect()` defaults to serial scheduling over the selected tab. Pass `scheduling: { mode: 'per-tab', maxConcurrentTabs, maxQueuedActions }` to overlap independent tabs, and target a tab explicitly with the optional `tabId` on the page tools (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_press_key`, `browser_screenshot`); `browser_open_tab` returns a stable ID. A browser handle allows one active automation connection: share it between agents and disconnect before reconnecting.

Operational failures reject with a structured `BrowserError` carrying `code`, `retryable`, `recovery`, and `phase`. Branch on `retryable` and `recovery` rather than the code alone; `human_control_conflict` reports an action rejected by a pending human takeover, and `connection_timeout` and `readiness_timeout` bound the connection and readiness waits.

## Choose navigation policy

Use `{ mode: 'origins', origins }` for a known application or documentation set. Use `allow-all-http` only when infrastructure networking already provides the required isolation and the product accepts open web navigation.

Navigation policy is not content trust. Web pages can contain prompt injection, misleading controls, private data, and destructive actions. Keep consequential product operations behind application tools with authorization and, when appropriate, an Agent interaction.

## Human takeover

The desktop control lease waits for the active browser action, blocks new agent actions, and expires unless renewed. Use it for debugging or an intentional operator handoff, not as an authorization mechanism.

Continue with the [`@anvia/browser` package guide](/packages/browser) and [Studio browser desktop](/studio/browser).
