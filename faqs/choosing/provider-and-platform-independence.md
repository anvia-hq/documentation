# Is Anvia independent of model providers and deployment platforms?

Anvia is provider-neutral and framework-agnostic at its core, but no runtime is independent of concrete capabilities. Your application still selects provider adapters, infrastructure, and a deployment environment that supports the APIs it uses.

Provider neutrality means agents and workflows depend on Core model contracts rather than one vendor client. You can inject a different compatible model without rewriting the entire runtime composition. It does not mean providers produce equivalent answers or support the same tools, schemas, media, context limits, parameters, or streaming behavior.

Platform independence means Anvia is not tied to one web framework or hosting vendor. Server helpers use Fetch and Web Streams APIs, and the runtime is composed in TypeScript. Individual features still have environment requirements:

- MCP `stdio` requires a process-capable server runtime.
- File and PDF loaders require appropriate file or binary access.
- React UI targets React DOM and browser interactions.
- Resumable streams need shared durable storage in multi-worker deployments.
- Long-running pipelines may need application-owned queues and workers.

Keep provider credentials and model execution on a trusted server boundary. A browser client should call an authenticated application route rather than receive provider API keys.

Review the [provider model boundary](/sdk/providers/model-boundary), [provider capability matrix](/sdk/providers/capability-matrix), [package compatibility and versioning](/packages/compatibility-and-versioning), and [`@anvia/server` runtime compatibility](/packages/server#runtime-compatibility) before choosing a target platform.
