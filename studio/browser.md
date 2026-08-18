# Browser desktop

Studio can display a registered `@anvia/browser` desktop on the Sandboxes page and in a resizable Playground workspace while browser tools run.

```ts
const studio = new Studio([agent], {
  sandboxes: [{
    inspector: browser.inspector({ files: true, ports: true, processes: true }),
    agentIds: [agent.id],
    toolNames: browserTools.map((tool) => tool.name),
    views: [{
      id: 'desktop',
      label: 'Chromium',
      source: browser.desktop,
      access: { mode: 'local' },
      authentication: { type: 'password', password },
    }],
  }],
})
```

When a registered agent uses a matching browser tool, Playground opens the current desktop automatically. Closing the panel does not stop Chromium; **Open browser** restores the view.

Selecting **Take control** acquires a renewable browser-control lease. Studio waits for the active agent action, then blocks new browser tool actions until the lease is released or expires. This coordinates one trusted operator with the agent—it does not replace Studio authentication or application authorization.

Use `access: { mode: 'authorize', authorize }` when the Studio origin is reachable remotely. The callback protects the viewer request, WebSocket upgrade, and control operations. Studio never owns or destroys the registered browser.

Continue with [Sandboxes](/studio/sandboxes) and [Browser security](/packages/browser/security).
