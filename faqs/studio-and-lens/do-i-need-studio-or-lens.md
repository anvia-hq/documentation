# Do I need Studio or Lens to use the Anvia SDK?

No. The Anvia SDK runs inside your application without Studio or Lens. Both products are optional and solve different problems around the runtime.

| Use | Choose |
| --- | --- |
| Run and debug registered agents, tools, or pipelines locally | Studio |
| Inspect local sessions, traces, retrieval, and configuration while developing | Studio |
| Retain production traces across services, users, sessions, and releases | Lens |
| Run team evaluation, dataset, comparison, and quality-gate workflows | Lens |
| Execute Anvia agents in the application | Neither is required |

Use Studio when it shortens the development loop. It is a trusted local console with real execution authority, so do not expose it as a production dashboard.

Use Lens when retained operational evidence and evaluation workflows justify running the additional self-hosted services. Lens is not application memory or authorization, and operating it means owning HTTPS, secrets, databases, backups, upgrades, access, and retention policy.

You can adopt them independently. A small application may use only Core and a provider adapter. A team may use Studio locally without Lens, send production telemetry to Lens without running Studio, or use both at their intended lifecycle stages.

See [how Studio works](/studio/how-studio-works), [Lens core concepts](/lens/core-concepts), and the [package catalog](/packages/catalog) to decide which optional components belong in your stack.
