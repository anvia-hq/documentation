# Visible browser agents

Use `@anvia/browser` when an agent must operate a real Chromium session that a developer or authorized operator can watch. The application owns the image, network, browser lifetime, selected tools, navigation policy, and any human takeover.

## Recommended lifecycle

1. Construct `DockerSandboxClient` and `DockerBrowserClient` without I/O.
2. Pull or otherwise provision a pinned browser image explicitly.
3. Create one browser for one bounded application task.
4. Wait for readiness and open a CDP connection.
5. Create only the semantic tools the task needs.
6. Register the agent and optional Studio desktop view.
7. Disconnect and destroy the browser in application-owned cleanup.

Have the agent call `browser_snapshot` before clicking or typing. Prefer role, label, or test-ID targets over CSS. Add tab tools only when multi-tab work is expected.

## Choose navigation policy

Use `{ mode: 'origins', origins }` for a known application or documentation set. Use `allow-all-http` only when infrastructure networking already provides the required isolation and the product accepts open web navigation.

Navigation policy is not content trust. Web pages can contain prompt injection, misleading controls, private data, and destructive actions. Keep consequential product operations behind application tools with authorization and, when appropriate, an Agent interaction.

## Human takeover

The desktop control lease waits for the active browser action, blocks new agent actions, and expires unless renewed. Use it for debugging or an intentional operator handoff, not as an authorization mechanism.

Continue with the [`@anvia/browser` package guide](/packages/browser) and [Studio browser desktop](/studio/browser).
