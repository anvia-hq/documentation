# Is Anvia free?

Yes. The core workflow requires no payment and no Anvia account: install the packages, build agents with your own model providers and databases, inspect them locally in Studio, and deploy the application wherever you already run your code. Self-hosted Lens is also free to use.

The runtime, Channels, and Lens are open source. The runtime and Channels packages use the MIT license, while Lens uses the AGPL-3.0-only license. Model providers, storage, and telemetry connect through replaceable adapters, and nothing in the core requires Anvia-operated infrastructure.

## What is open

Everything needed to build and own the application:

- The runtime packages, including [`@anvia/core`](/packages/core), the provider packages, the memory, vector, graph, and observability adapters, durable execution, and sandboxes.
- [Channels](/channels/) adapters for Discord, Slack, and Telegram.
- Local development with [Studio](/studio/): playground runs, inspection, and replay against the agents your application registers.
- Production observability and evaluation with self-hosted [Lens](/lens/): retained traces, team evaluation workflows, datasets, release comparisons, and quality gates.
- Deployment. An Anvia application is your TypeScript application; it runs on your infrastructure under your processes.

## Choosing an observability path

Lens is optional. The runtime also connects to Langfuse and OpenTelemetry pipelines through adapters, so both of these are supported paths:

- Run the runtime and keep production telemetry in your existing observability stack.
- Adopt self-hosted Lens when retained, team-oriented operational workflows justify running it.

## License boundary

The MIT license for the runtime and Channels packages is permissive. Lens is [licensed under AGPL-3.0-only](https://github.com/anvia-hq/lens/blob/main/LICENSE), so if you modify Lens and make that version available over a network, you must offer its corresponding source to its users under the same license.

See [how Anvia reduces vendor lock-in](/faqs/production/vendor-lock-in) and [what your application still owns](/faqs/understanding/application-ownership).
