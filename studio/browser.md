# Browser desktop (retired)

The dedicated Studio browser desktop belonged to the retired `@anvia/browser` package. Studio now
shows a remote sandbox's desktop through the sandbox registration described in
[Sandboxes](/studio/sandboxes).

Use `studioSandbox(hub, sandboxId, { agentIds, toolNames })` from `@anvia/sandbox/remote` to give
Studio an inspector and a live desktop view for a remote sandbox. A person can watch the agent and
take control; taking control pauses the agent's desktop inputs until the person releases the lease.

See the [sandbox desktop guide](/sdk/advanced/sandbox/desktop) for the underlying desktop contract
and the [`@anvia/browser` retirement notice](/packages/browser) for the package history.