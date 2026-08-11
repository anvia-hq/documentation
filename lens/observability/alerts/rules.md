# Alert rules

An alert rule defines one signal, its scope, and the condition that opens an incident. Open **Alerts**, select the **Rules** tab, then select **New rule**.

Only project owners and admins can manage rules. Other project members can still see the configured rules and work with their incidents.

## Choose a rule type

Lens provides three runtime rules and two quality rules.

### Runtime health

| Trigger | Measurement | Useful for |
| --- | --- | --- |
| Trace error rate | Failed traces divided by matching traces. | Detecting application-wide or service-specific failures. |
| P95 trace duration | Exact P95 of full matching trace durations in milliseconds. | Detecting slow end-to-end runs. This is not time to first token. |
| Tool error rate | Failed tool observations divided by matching tool observations. | Detecting an unreliable tool or integration. |

For each runtime rule, configure:

- **Threshold** — a percentage for error rates or milliseconds for P95 duration.
- **Window** — the previous 5, 15, or 60 minutes.
- **Minimum samples** — the smallest matching population Lens may evaluate.
- **Environment** and **service** — optional exact-match scopes.
- **Tool name** — an optional exact match available only for tool error rate.

A blank scope includes all values in that project. Use the stable names emitted by your instrumentation, including capitalization.

::: tip A practical starting point
Scope production rules to `environment = production`. Choose a window long enough to collect a representative population, then set a minimum sample count that prevents a single failed request from becoming an error-rate incident.
:::

### Quality signals

**Failed human review** watches pass/fail trace reviews. You can scope it to an exact environment and service. A failed review opens an incident for that trace; a passing review of the same trace resolves the active incident.

**Failed quality gate** watches one quality gate. A check opens an incident when its verdict is `fail` or `insufficient_data`. A passing check for the same gate, candidate run, and baseline run resolves that incident. Create the quality gate before creating this rule.

Quality rules do not have thresholds, rolling windows, or minimum sample counts. They react when Lens records the relevant review or comparison.

## How runtime evaluation works

The Lens worker evaluates enabled runtime rules every minute. It queries the latest configured window and follows this sequence:

```text
not enough samples -> reset consecutive breaches; do not alert
healthy value      -> resolve the active incident, if any
first breach       -> remember the breach; do not alert yet
second breach      -> open or update the incident
later breaches     -> update the same active incident
```

A value equal to the threshold counts as a breach. Two consecutive checks reduce noise, so a newly created rule normally cannot produce a runtime incident on its first evaluation. If a check has no measurement or fewer than the configured minimum samples, Lens resets the consecutive-breach count.

After a runtime incident resolves, Lens applies a 30-minute cooldown before that rule can open another one. Lens continues evaluating the rule during the cooldown.

## Create a useful first rule

For a production service with steady traffic, a trace error-rate rule could use:

| Field | Example |
| --- | --- |
| Name | Production API errors |
| Trigger | Trace error rate |
| Threshold | 5% |
| Window | 15 minutes |
| Minimum samples | 20 |
| Environment | `production` |
| Service | `support-api` |

This configuration is only an example. Base the threshold and sample count on the service's normal traffic and error budget.

## Editing, disabling, and deleting

- **Disable** a rule to stop future evaluation without removing its configuration. Because disabling is a rule update, it also resolves active incidents as `rule_changed`.
- **Edit** a rule when its signal or scope is wrong. Any edit resolves its active incidents with the `rule_changed` resolution and resets its breach and cooldown state.
- **Delete** a rule when it is no longer useful. Deletion resolves its active incidents with the `rule_deleted` resolution, but preserves incident history.

An incident keeps a snapshot of the condition that produced it, so later rule changes do not rewrite the historical investigation context.

## Current limits

- A project can contain at most 25 rules.
- Rule names are unique per project, ignoring case.
- Runtime scopes use exact string matching; there are no patterns or grouped scopes.
- Only 5, 15, and 60-minute runtime windows are supported.
- Alerts are displayed in Lens only; outbound notification channels are not implemented.

When a rule triggers, continue with [Incidents](/lens/observability/alerts/incidents).
