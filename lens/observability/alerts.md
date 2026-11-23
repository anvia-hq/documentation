# Alerts

Alerts turn a runtime regression or failed quality check into an incident that your team can investigate inside Lens.

Use them after telemetry and evaluations are already flowing. Alerts do not collect new data: they evaluate the traces, reviews, and quality-gate checks in the current Lens project.

## What you can monitor

| Signal | Opens an incident when |
| --- | --- |
| Trace error rate | The share of failed traces meets or exceeds your threshold. |
| P95 trace duration | The 95th-percentile full trace duration meets or exceeds your threshold. |
| Tool error rate | The share of failed tool observations meets or exceeds your threshold. |
| Failed human review | A matching trace is reviewed with a failed outcome. |
| Failed quality gate | The selected gate returns `fail` or `insufficient_data`. |

Runtime rules evaluate rolling telemetry windows. Review and quality-gate rules respond to the corresponding event instead of waiting for a runtime window.

## Recommended workflow

1. Open **Alerts** in the project sidebar.
2. Create a narrowly scoped rule with a meaningful minimum sample count.
3. Wait for Lens to open an incident; runtime rules require two consecutive breached checks.
4. Open the incident and inspect its signal, evidence, and likely contributors.
5. Acknowledge it when investigation begins, then resolve it when the problem is handled.

Start with [Alert rules](/lens/observability/alerts/rules) to configure a signal, or continue to [Incidents](/lens/observability/alerts/incidents) to understand investigation and resolution.

## Delivery today

Lens currently surfaces incidents in the web application. The project sidebar shows the number of active incidents, and the **Incidents** tab provides the complete active and resolved history. Owners/admins can configure Slack, Discord, Telegram, and webhook [notification channels](/lens/observability/alerts/channels), then select them in a rule’s **Send to** field. Native email and PagerDuty channels are not included.

Delivery is triggered when an incident opens, not on every acknowledgement or resolution. Inspect its **Deliveries** card for status, attempts, and errors. Keep your paging and escalation policy application-owned; Lens does not guarantee on-call response.

## Access and ownership

Every member with access to a project can view, acknowledge, and resolve its incidents. Only project owners and admins can create, edit, enable, disable, or delete rules. Owners and admins can also promote retained evidence traces into a managed dataset draft.

Rules and incidents are project-scoped. Incident links retain their project context; this is not human access isolation, since workspace members can access every project in that workspace.

## Operational requirements

Runtime evaluation depends on the Lens worker and its Redis-backed alert queue. The worker schedules a check once per minute; creating or updating a rule also queues a check for that project. If the worker or queue is unavailable, telemetry ingestion can continue, but runtime incidents will not be evaluated until processing resumes.

Lens permits up to 25 rules per project. Rule names must be unique within the project, ignoring case.

