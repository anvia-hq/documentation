# What is Anvia Lens?

Lens is an optional self-hosted observability and evaluation workspace for AI applications. It retains telemetry so a team can investigate traces, model generations, tools, sessions, users, latency, token usage, cost, and failures across environments and releases.

Lens also connects production evidence to evaluation workflows. Teams can curate datasets, run evaluation suites, compare releases, inspect failed cases through their traces, and configure quality gates.

The native `@anvia/lens` adapter records Anvia runs, generations, and tool calls without replacing the application's global OpenTelemetry provider. It exports only the configured Anvia activity; it does not automatically collect unrelated application spans. Safe capture is the default, so prompt and response bodies are not retained unless the application deliberately enables fuller capture.

Lens is operational telemetry, not application state. It does not replace conversation memory, business records, authentication, authorization, user-visible job status, or application logs. The application supplies stable session, user, environment, and release context when those dimensions are needed.

Unlike Studio's local, process-oriented history, Lens is designed for retained team workflows across development, staging, and production. Self-hosting also makes the operator responsible for HTTPS, secrets, storage, backups, upgrades, retention, and incident response.

Start with [Lens](/lens/), [core concepts](/lens/core-concepts), [connect Anvia](/lens/connect/anvia), and [evaluations](/lens/evaluations). The native adapter is documented under [`@anvia/lens`](/packages/lens).
