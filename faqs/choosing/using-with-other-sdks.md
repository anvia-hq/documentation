# Can I use Anvia with other SDKs?

Yes. Anvia is embedded in application code and can be used alongside provider SDKs, database clients, queues, web frameworks, telemetry libraries, and other agent or workflow systems.

Common integration patterns include:

- Use an Anvia provider adapter for standard model calls and call the vendor SDK directly for an unsupported provider-specific endpoint.
- Wrap an existing application service or third-party SDK in an Anvia [tool](/sdk/tools/define).
- Implement a Core model, memory, vector-store, or observer contract around an existing client.
- Run an Anvia agent as one stage inside an application-owned worker or workflow.
- Expose Anvia stream events through an existing server framework using [`@anvia/server`](/packages/server).
- Connect a custom client through the [`EventTransport` contract](/packages/react/api-reference#transports).

Do not hide ownership boundaries merely to make everything look like one SDK. Provider-specific calls should remain visibly provider-specific. Tool wrappers must preserve authentication, authorization, timeouts, idempotency, and error behavior. A second agent runtime may also introduce two event models, two memory systems, or competing retry policies; define which system owns each concern.

Anvia does not require Studio or Lens for these integrations. Studio can help inspect the Anvia portion locally, while Lens can observe configured Anvia runs. Neither automatically traces unrelated SDK calls unless you connect them through supported telemetry or application instrumentation.

See the [`@anvia/core` API reference](/packages/core/api-reference), [hooks and middleware](/sdk/advanced/hooks), and [observability packages](/packages/catalog) for the available extension boundaries.
