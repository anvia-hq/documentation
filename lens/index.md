# Lens

Lens is a self-hosted observability and evaluation workspace for AI applications. It turns agent activity into traces you can investigate, connects related activity through sessions and users, and carries production examples into evaluations, datasets, release comparisons, and quality gates.

Use Lens when a log line can tell you that a request failed, but cannot explain which model call, tool, or agent step caused it.

## Reviewed baselines

Lens server guides were fully reviewed on **2026-11-23** against [v0.20.0 source](https://github.com/anvia-hq/lens/tree/b06101f36392d4b1bab5a1b69a53d29e67fc22f5). The deployment and startup guidance was then checked against [v0.20.1 source](https://github.com/anvia-hq/lens/tree/2dc16cc7e1cf32e3b3bde365c7164bb704212a4c) (`2dc16cc7e1cf32e3b3bde365c7164bb704212a4c`). The [v0.20.1 release](https://github.com/anvia-hq/lens/releases/tag/v0.20.1), its successful release workflow, and both `0.20.1` image tags were verified separately; publication is not proof of your deployment’s health. Evaluation guidance was rechecked on **2026-11-28** against [v0.22.1 source](https://github.com/anvia-hq/lens/releases/tag/v0.22.1), which stores per-trial evaluation results; the remaining server guides have not been re-reviewed against v0.21 or v0.22.

The SDK has an independent [reviewed baseline](/packages/compatibility-and-versioning): `@anvia/lens` source 1.3.2 at SDK revision `dd0dec5c`. The published 1.2.5 artifact was also checked for prompt APIs. A server review does not refresh the SDK inventory or establish compatibility with every package version.

## What Lens helps you answer

| Question | Start with |
| --- | --- |
| Why was this request slow or expensive? | Trace observations, timing, tokens, and cost. |
| Which tool or model call failed? | The trace observation tree. |
| Is one conversation or user repeatedly affected? | Sessions and users. |
| Did a new release change quality? | Evaluation runs and release comparison. |
| Should this version be allowed to ship? | Quality gates. |

Lens accepts native Anvia telemetry through `@anvia/lens`. It is OpenTelemetry-native and can also ingest supported Langfuse OTLP instrumentation.

## A typical workflow

```text
Instrument an agent
        ↓
Inspect real traces
        ↓
Review failures and curate cases
        ↓
Run repeatable evaluations
        ↓
Compare releases and enforce a quality gate
```

Observability and evaluation use the same project context. A trace discovered during production review can therefore become evidence for a future test instead of remaining an isolated incident.

## Start here

| Page | What you will do |
| --- | --- |
| [Install and setup](/lens/install-and-setup) | Run Lens, create a project, and obtain ingestion credentials. |
| [Your first trace](/lens/your-first-trace) | Connect an Anvia agent and verify its first exported run. |
| [Core concepts](/lens/core-concepts) | Understand projects, traces, observations, sessions, evaluations, and datasets. |

After the first trace arrives, continue to [Connect Anvia](/lens/connect/anvia) for capture policy and runtime configuration, or open [Traces](/lens/observability/traces) to learn the investigation workflow.

## Operate the workspace

- [Prompt management](/lens/prompts): commit versions and move deployment labels.
- [Notification channels](/lens/observability/alerts/channels): send new incidents to supported destinations.
- [OIDC and SSO](/lens/workspace/oidc): configure identity-provider admission.
- [MCP access](/lens/workspace/mcp-access): expose read-only diagnostics to an assistant.
- [System Health](/lens/self-hosting/system-health): diagnose capacity, ingestion, and queues.

## What Lens does not replace

Lens is operational telemetry, not application state. Keep conversation memory, authorization, business records, and user-visible job status in the systems that own those concerns.

Payloads can contain customer or internal data. Native Anvia tracing starts in safe capture mode, which retains useful structure and operational metadata without exporting prompt and response bodies. Enable full capture only after deciding who may access the data and how long it may be retained.
