# What is Anvia?

Anvia is a composable, provider-neutral TypeScript runtime for building model-powered application behavior. It runs inside your application code and coordinates models, messages, tools, memory, retrieval, structured output, pipelines, and streaming through explicit interfaces.

The main runtime is `@anvia/core`. Provider packages turn vendor APIs into Core model contracts, while storage and observability adapters connect the runtime to infrastructure selected by the application. You can use a single direct completion helper or assemble a longer-running agent without adopting a separate application framework.

Anvia has three related surfaces:

- **Anvia SDK** is the embedded runtime and its packages.
- **Studio** is an optional local console for running and inspecting configured agents, pipelines, tools, and development data.
- **Lens** is an optional observability and evaluation product for deployed systems.

Studio and Lens are not required to execute an Anvia agent. They add development and operational workflows around the runtime.

Anvia is intentionally not responsible for your product architecture. Your application still owns authentication, authorization, credentials, business data, persistence choices, deployment, user interfaces, and decisions about what data may reach a model or telemetry system.

Start with [the SDK introduction](/sdk/), inspect the [`@anvia/core` package](/packages/core), or read [how Studio works](/studio/how-studio-works).
