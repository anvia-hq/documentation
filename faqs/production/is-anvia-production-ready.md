# Is Anvia production-ready?

Anvia provides primitives intended for production applications, but installing the SDK does not make an application production-ready by itself.

The runtime can bound agent turns, validate tool arguments, stream structured events, persist memory through adapters, expose cancellation through stream consumption, emit telemetry, and run evaluation suites. The application must still turn those capabilities into an operational policy.

## What Anvia provides

- Explicit model, tool, memory, pipeline, streaming, and observer contracts.
- Agent turn and tool-concurrency controls, per-run abort signals, and explicit streaming cancellation boundaries.
- Provider, storage, vector, graph, UI, and observability adapters.
- Studio for local inspection.
- Lens, Langfuse, or OpenTelemetry integrations for retained operational telemetry.
- Evaluation suites in `@anvia/core/evals` for testing behavior before and after release.
- Experimental durable execution for agent runs that must survive a restart.

## Which packages are stable?

Core is a stable v1 package (`1.22.0`), and most adapters are stable 1.x releases. Packages version independently, and the SDK release policy currently prohibits major releases. Some packages are not yet stable:

- `@anvia/durable` (`0.18.0`) is experimental; its database records may change between releases.
- `@anvia/azure` (`0.1.12`) and `@anvia/jev` (`0.3.1`) are pre-1.0.
- The Channels packages (`0.3`–`0.5`) are pre-1.0.

Pin exact versions and review release notes before upgrading pre-1.0 packages. See [compatibility and versioning](/packages/compatibility-and-versioning).

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

Continue with [agent errors and limits](/sdk/agents/errors-and-limits), [tool security](/sdk/tools/security), [provider selection](/sdk/providers/choose-a-provider), [Security](/features/security), [runtime support](/faqs/production/runtime-support), and [testing agent behavior](/faqs/production/testing-agent-behavior).

Reviewed against Anvia SDK `7aa42c0a` on 2026-11-24.
