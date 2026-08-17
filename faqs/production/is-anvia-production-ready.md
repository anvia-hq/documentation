# Is Anvia production-ready?

Anvia provides primitives intended for production applications, but installing the SDK does not make an application production-ready by itself.

The runtime can bound agent turns, validate tool arguments, stream structured events, persist memory through adapters, expose cancellation through stream consumption, emit telemetry, and run evaluation suites. The application must still turn those capabilities into an operational policy.

## What Anvia provides

- Explicit model, tool, memory, pipeline, streaming, and observer contracts.
- Agent turn and tool-concurrency controls, plus explicit streaming cancellation boundaries.
- Provider, storage, vector, UI, and observability adapters.
- Studio for local inspection.
- Lens or OpenTelemetry integrations for retained operational telemetry.
- Evaluation primitives for testing behavior before and after release.

## What the application owns

- Authentication and authorization.
- Tenant isolation and data access.
- Secrets and provider accounts.
- Hosting, scaling, queues, retries, and deployment topology.
- Database provisioning, migrations, backups, and retention.
- Model allow-lists, budgets, and fallback policy.
- Incident response and user-facing error behavior.

Production readiness is therefore a property of the complete application, not a package badge.

## A practical readiness check

Before shipping, confirm that the system can answer:

1. Who is allowed to start this run and execute each tool?
2. Which model, provider, and configuration are approved?
3. What bounds cost, turns, concurrency, wall-clock time, and output size at each owning layer?
4. What happens when the request, provider, tool, database, or worker fails?
5. Which data is stored or exported, and for how long?
6. How are behavior regressions detected before and after deployment?

Continue with [agent errors and limits](/sdk/agents/errors-and-limits), [tool security](/sdk/tools/security), [provider selection](/sdk/providers/choose-a-provider), and [testing agent behavior](/faqs/production/testing-agent-behavior).
