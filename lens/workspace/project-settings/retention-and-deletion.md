# Retention and deletion

Retention expires a project's telemetry over time. Project deletion permanently removes the project itself and all project-owned data. Use retention for routine lifecycle, selective deletion for individual records, and project deletion when the entire project is no longer needed.

Retention changes and deletion actions require the `owner` or `admin` workspace role.

## Choose a retention period

Open the project's **Settings** page and choose one of the current options:

| Setting | Effect |
| --- | --- |
| 7 days | Keeps a short investigation window. |
| 30 days | The default balance for ordinary operational review. |
| 90 days | Supports longer comparisons and incident investigation. |
| Unlimited | Prevents time-based telemetry expiration. |

Select **Save retention** to apply the change. Lens queues background reconciliation rather than rewriting all retained records during the request.

## Know what retention covers

The project retention window applies to telemetry-backed data:

- traces and their spans or observations;
- evaluation results;
- evaluation runs.

Observed evaluation data is derived from reported evaluation telemetry and therefore follows that lifecycle. Managed datasets and workspace or project configuration are not ordinary telemetry and are not removed by the retention window.

When a trace used as alert evidence expires, the incident may remain while its trace is no longer available.

## Understand a retention change

Expiration is calculated from each record's own event time, not from the day you change the setting.

- **Shortening retention** can make older telemetry eligible for deletion as soon as reconciliation and storage cleanup complete.
- **Extending retention** updates expiration for records that still exist.
- **Unlimited** moves retained telemetry to a non-expiring horizon.
- No retention change can restore data that storage has already deleted.

Already accepted jobs retain the expiration calculated at admission. If a new policy must cover accepted-but-unwritten data, pause producers and drain ingestion before changing retention, then let reconciliation run.

Because reconciliation and physical cleanup are asynchronous, old records may remain visible briefly after saving a shorter period.

Choose the period together with capture policy. Full prompt and response capture may require a shorter window or stricter access than metadata-only traces.

## Delete selected telemetry

Owners/admins can delete traces, sessions, or evaluation runs from their investigation views without removing the project. Requests accept 1–100 IDs and run asynchronously. Confirm the entity and preserve required evidence first.

| Scope | Removed telemetry |
| --- | --- |
| Trace | Spans, trace summary, and linked evaluation results. |
| Session | Matching traces and their linked telemetry. |
| Evaluation run | Run and evaluation results; underlying traces remain. |

Follow request progress through queued/running/completed/failed status; worker availability is required. These are point-in-time cleanups, not identifier blocklists. Producers and previously accepted jobs can recreate those IDs. Pause producers and drain ingestion before deleting when the data must stay absent.

## Delete the project

Before deletion:

1. Confirm the active project name.
2. Export or back up anything that must be retained.
3. Identify every application using the project's ingestion keys.
4. Decide where those applications should send telemetry next, or stop their exporters.

Open **Settings**, find **Danger zone**, select **Delete project**, and confirm.

Lens then:

1. marks the project as deleting;
2. revokes all project ingestion keys immediately;
3. queues background deletion of traces, observations, and evaluation telemetry;
4. removes the project's database record and project-owned configuration after telemetry cleanup.

The operation has no restore workflow. Project-owned managed datasets, gates, alerts, keys, reviews, and settings are removed with the project through database cleanup.

## If deletion remains in progress

Project deletion depends on the maintenance worker. A project can remain in the deleting state if that worker is unavailable or its job repeatedly fails.

The deleting row remains and ingestion stays blocked while cleanup fails; maintenance retries and exhausted jobs need operator recovery. Cleanup waits for mutations on all four ClickHouse telemetry tables before removing the project row. Check [System Health](/lens/self-hosting/system-health) and worker/queue failures before changing infrastructure. Sending with an old key will not resume ingestion because keys are revoked when deletion begins.

Project fencing coordinates writers with PostgreSQL row locks; it is not a transaction across databases. If PostgreSQL connectivity is lost while an unacknowledged ClickHouse write is still executing, stop writers, wait for outstanding queries to finish, and repeat project telemetry cleanup before treating erasure as verified. All writers must run the fenced implementation.

For credential-only incidents, revoke the affected key instead of deleting the project; see [Ingestion keys](/lens/workspace/project-settings/ingestion-keys).
