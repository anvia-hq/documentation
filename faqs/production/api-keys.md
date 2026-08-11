# Where should API keys and secrets live?

Keep model-provider, database, telemetry, and integration credentials in a trusted server or worker environment. Do not embed them in browser bundles, public environment variables, prompts, or tool results.

## Recommended boundary

The browser sends an authenticated request to an application route. That route selects the approved provider configuration, runs the completion or agent, and returns normalized output or a stream. The user never receives the provider credential.

## Separate credentials by responsibility

- Where the provider supports it, scope keys to only the projects and capabilities the application needs.
- Use database roles that cannot access unrelated tenant data.
- Keep Lens ingestion key pairs separate from workspace sign-in and application-session secrets.
- Scope third-party tool credentials to the minimum operations required.
- Use non-production accounts and credentials in Studio.

## Avoid secret-shaped telemetry

Prompts, tool arguments, tool results, attachments, and metadata can contain credentials even when configuration values are stored correctly. Begin observability with safe capture, apply redaction, and review retention before enabling full payload collection.

See [install and setup](/sdk/install-and-setup), [Lens capture and privacy](/lens/connect/anvia/capture-and-privacy), and [Studio security boundaries](/studio/configure/security-boundaries).
