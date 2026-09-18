# Is Anvia free?

Yes. The core workflow requires no payment and no Anvia account: install the packages, build agents with your own model providers and databases, inspect them locally in Studio, and deploy the application wherever you already run your code.

The runtime is open source, and the architecture is open with it: model providers, storage, and telemetry connect through replaceable adapters, and nothing in the core requires Anvia-operated infrastructure.

## What is open

Everything needed to build and own the application:

- The runtime packages, including [`@anvia/core`](/packages/core), the provider packages, and the memory, vector, and observability adapters.
- Local development with [Studio](/studio/): playground runs, inspection, and replay against the agents your application registers.
- Deployment. An Anvia application is your TypeScript application; it runs on your infrastructure under your processes.

## What is commercial

Production operations. [Lens](/lens/), the observability and evaluation workspace, is Anvia's commercial product: retained traces across releases, team evaluation workflows, datasets, release comparisons, and quality gates.

Lens is optional. The runtime also connects to Langfuse and OpenTelemetry pipelines through adapters, so both of these are supported paths:

- Run the runtime and keep production telemetry in your existing observability stack.
- Adopt self-hosted Lens when retained, team-oriented operational workflows justify running it.

## Why the boundary exists

Revenue comes from making production operations easier, not from custody of the application. That is why the open packages cover the full build path and why there is no hosted runtime requirement: the design goal is the opposite of lock-in.

See [how Anvia reduces vendor lock-in](/faqs/production/vendor-lock-in) and [what your application still owns](/faqs/understanding/application-ownership).
