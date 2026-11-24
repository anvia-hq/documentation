# Visible browser agents (retired)

The `@anvia/browser` package is retired. It no longer receives releases, and its semantic
`browser_*` tools have no direct replacement. Anvia now runs a full desktop inside a remote
sandbox: an agent can inspect screenshots and drive the desktop with mouse and keyboard tools while
a person watches or takes over.

Use the [sandbox desktop guide](/sdk/advanced/sandbox/desktop) for the current approach, including:

- `hub.desktop(sandboxId)` for screenshots, input, resizing, status, and control locks;
- `createDesktopTools()` for agent-facing `desktop_*` tools;
- the sandbox desktop image, daemon environment, and `create-image --name <name> --feature desktop`; and
- the Studio desktop viewer for a registered remote sandbox.

For the retirement notice and migration table, see the [`@anvia/browser` package page](/packages/browser).