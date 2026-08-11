# Why would I choose Anvia?

Choose Anvia when you want model-powered behavior expressed as composable TypeScript application code, while keeping model providers and infrastructure behind explicit contracts.

The practical reasons are:

- One runtime vocabulary for messages, tools, agents, memory, retrieval, pipelines, streaming, and structured output.
- Provider adapters that can be selected at composition time instead of embedded throughout product logic.
- Typed boundaries for tools, schemas, stores, observers, and transports.
- The option to start with one direct completion and add runtime features only when needed.
- Optional Studio inspection during development and optional Lens workflows in production.

Those benefits matter most when several features need consistent runtime behavior or when the application expects models and infrastructure to change over time. They matter less for a tiny provider-specific integration that is already clear with the vendor SDK.

Provider neutrality is also not behavioral equivalence. Models differ in tool use, structured output, media support, streaming events, context limits, latency, and cost. Anvia normalizes contracts where practical; the application still chooses providers and handles capability differences.

Compare the [capability overview](/faqs/choosing/capability-overview), browse the [package catalog](/packages/catalog), and review [when not to use Anvia](/faqs/understanding/when-not-to-use-anvia) before committing to the runtime.
