# `@anvia/browser` (retired)

`@anvia/browser` is retired. The package was removed from the Anvia source repository after
`1.1.13`, and npm marks the published package as deprecated. It receives no further releases or
security fixes.

The package combined a Docker-backed Chromium runtime, semantic `browser_*` tools, a noVNC
desktop, and coordinated human takeover. Use the [`@anvia/sandbox` desktop](/sdk/advanced/sandbox/desktop)
instead: a remote sandbox can run a virtual display with Chromium, an agent can drive it with
`createDesktopTools()`, and a person can watch or take over the same display.

## What replaces what

| Retired surface | Current approach |
| --- | --- |
| Managed Chromium container and browser image | Build or pull an `@anvia/sandbox` desktop image and run `anvia-sandbox-daemon` |
| `browser_snapshot`, `browser_click`, `browser_type`, and other semantic tools | `desktop_screenshot`, `desktop_click`, `desktop_type`, `desktop_key`, and the other tools from `createDesktopTools()` |
| noVNC desktop and human-control lease | The sandbox desktop relay with `takeover()` and `release()`, or Studio's sandbox desktop view |
| Session-scoped automation connection | The sandbox desktop capability exposed by `RemoteSandboxHub` |

The migration is not a drop-in replacement. Semantic browser tools act on Playwright locators and
ARIA snapshots; desktop tools act on screenshot pixels and keyboard input. They have no direct
replacement, and the application must re-evaluate navigation policy, prompt-injection exposure, and
action reliability for a desktop workflow.

## Migration outline

1. Install `@anvia/sandbox` and use a desktop image. The `create-image --name <name> --feature desktop` builder
   generates one, and the reference image under `packages/tool-sandbox/images/desktop` shows the
   required programs.
2. Run `anvia-sandbox-daemon` inside the sandbox and connect it to a `RemoteSandboxHub`.
3. Open the desktop with `hub.desktop(sandboxId)` and pass `createDesktopTools({ sandbox })` to the
   agent.
4. Replace browser-specific readiness, navigation, and takeover code with the sandbox desktop's
   status, screenshot, action, and control-lock contracts.
5. Keep authorization, ticket issuance, network policy, tenant isolation, secrets, and cleanup in
   the application. The hub does not create or destroy sandboxes.

The last source release is available for historical reference at
[commit `bbc56259`](https://github.com/anvia-hq/anvia/tree/bbc56259/packages/tool-browser), including
its [changelog](https://github.com/anvia-hq/anvia/blob/bbc56259/packages/tool-browser/CHANGELOG.md)
and [migration notes](https://github.com/anvia-hq/anvia/blob/bbc56259/packages/tool-browser/MIGRATION.md).
Do not start new work on the retired package.

## Next steps

- [Sandbox desktop guide](/sdk/advanced/sandbox/desktop)
- [Remote sandbox runtime](/sdk/advanced/sandbox/remote)
- [`@anvia/sandbox` package](/packages/sandbox)
- [Studio sandbox views](/studio/sandboxes)