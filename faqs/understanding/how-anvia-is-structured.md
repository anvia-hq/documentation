# How is Anvia structured?

Anvia is structured as small TypeScript packages around a provider-neutral core, with optional development and observability products around the runtime.

The layers are:

1. **Core contracts and runtime.** `@anvia/core` defines agents, model interfaces, messages, tools, memory, retrieval, pipelines, streaming events, and runtime controls.
2. **Provider adapters.** Packages such as `@anvia/openai`, `@anvia/anthropic`, and `@anvia/gemini` create model objects that implement Core contracts.
3. **Infrastructure adapters.** Memory, vector-store, logging, telemetry, and sandbox packages connect application-selected services.
4. **Application transport and UI.** `@anvia/server`, `@anvia/react`, and `@anvia/react-ui` provide optional streaming and interface layers.
5. **Development and operations.** Studio inspects a locally configured runtime; Lens handles production-oriented observability and evaluation workflows.

Your application composes only the layers it needs. A server-side extraction job may use Core and one provider package. A streamed React chat may also use Server, React, and React UI. Neither must use Studio or Lens at runtime.

This structure does not mean every adapter has identical capabilities. Provider features, vector filters, deployment requirements, and storage behavior differ. The shared contracts reduce coupling, but applications must still check the capability needed by each workflow.

See the [package overview](/packages/), [feature matrix](/packages/feature-matrix), and [model boundary](/sdk/providers/model-boundary) for the practical package and capability boundaries.
