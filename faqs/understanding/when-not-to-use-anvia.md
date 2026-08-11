# When should I not use Anvia?

Do not use Anvia when its runtime abstractions add more coordination than the feature needs, or when the workflow depends directly on a provider-specific surface that Anvia does not expose.

A direct provider SDK may be the better choice when:

- The feature is one small, stable provider call with no need for shared model contracts.
- You need a newly released vendor API before an Anvia adapter supports it.
- The application depends heavily on provider-specific request or response behavior.
- The target environment cannot support the package's required runtime APIs.
- Your team does not want an additional abstraction or dependency boundary.

You may still use Anvia without using an agent. Prefer [direct completions](/sdk/completions) for one model call and [structured output](/sdk/structured-output) for schema-validated data. Avoid multi-agent coordination when a deterministic pipeline, one agent, or ordinary application code is easier to test and operate.

Anvia also does not remove the need for mature infrastructure. High-volume background work still needs appropriate queues and workers. Sensitive deployments still need application-owned access controls, data policies, and vendor review.

Choose based on the concrete workflow rather than package count. The [capability overview](/faqs/choosing/capability-overview), [provider capability matrix](/sdk/providers/capability-matrix), and [package feature matrix](/packages/feature-matrix) can help identify whether the required surface is supported.
