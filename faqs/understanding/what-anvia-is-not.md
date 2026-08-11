# What is Anvia not?

Anvia is not a hosted model, a complete application framework, or an autonomous replacement for application logic. It is an embedded runtime and a set of integration contracts.

In particular, Anvia is not:

- A model provider. You still configure a supported vendor or implement the relevant model contract.
- A database or vector service. Adapters connect storage selected and operated by the application.
- An authentication or authorization system.
- A guarantee that different providers behave identically.
- A no-code agent builder. Agents are defined and composed in TypeScript.
- A job queue or workflow scheduler. Production pipelines may need BullMQ, Trigger.dev, or another application-owned worker system.
- A user interface framework. React UI provides optional composable primitives, not a finished product design.
- An automatic observability backend. Lens and telemetry adapters must be configured deliberately.
- A reason to turn every model call into a multi-turn agent.

Studio is a local development console, not the production runtime itself. Lens provides operational workflows, but it does not take ownership of application authorization, retention rules, or deployment architecture.

If a direct provider SDK already cleanly handles a small, provider-specific feature, adding a broader runtime layer may not help. See [when not to use Anvia](/faqs/understanding/when-not-to-use-anvia) and [choosing a provider](/sdk/providers/choose-a-provider).
