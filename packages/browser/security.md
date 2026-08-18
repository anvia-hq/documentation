# Security

The browser image runs Chromium as a non-root user with Chromium's process sandbox enabled, no-new-privileges, the pinned Playwright seccomp profile, and every Linux capability dropped except `SYS_CHROOT`. Startup fails instead of silently switching to `--no-sandbox`.

## Layer the boundary

- Pin the browser image by digest and scan it before deployment.
- Use exact-origin navigation policy when the destination set is known.
- Treat Docker bridge networking as ordinary network access, not SSRF isolation.
- Apply infrastructure egress policy for private, metadata, loopback, and tenant networks.
- Keep provider credentials and application sessions out of agent-visible page content.
- Bound action timeouts, navigation timeouts, snapshot size, runtime memory, shared memory, and process count.
- Destroy ephemeral browsers in `finally` or an application shutdown hook.

The navigation policy checks direct navigation, links, forms, redirects, and popups across the connection. It does not block third-party subresources loaded by an allowed page.

## Protect the desktop

The VNC password must be exactly eight printable ASCII characters. The package publishes noVNC only on a host-loopback port and does not publish raw VNC. Do not place the password in URLs, image metadata, logs, or browser-visible configuration.

Studio registrations should use `{ mode: 'local' }` only for a loopback-only Studio. Use `{ mode: 'authorize', authorize }` when Studio is reachable remotely, and authorize the page request, WebSocket upgrade, and every control operation.
