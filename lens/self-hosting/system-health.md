# System Health

Use **System Health** in workspace navigation when telemetry is delayed, dependencies fail, or the host is nearing capacity. Owners and admins can inspect this installation-wide view; ordinary project metrics do not diagnose queue admission or worker health.

The page refreshes every 15 seconds while foregrounded and has a manual **Refresh** action. It is a sampled diagnostic view, not proof of successful delivery or a substitute for external monitoring.

## Read the diagnostic layers

| Section | What to inspect |
| --- | --- |
| Machine resources | Linux host CPU, RAM, swap, root/Docker-data disks, and uptime. |
| Ingestion | Accepted/rejected activity, throughput, and stale metrics. |
| Services | PostgreSQL, ClickHouse, Redis, service capacity, and worker heartbeats. |
| Queues | Waiting, active, delayed, completed, and failed jobs by processing queue. |

Check **Updated** before trusting a sample. Missing host metrics can mean the collector is unavailable, not that the application has no load. Dependency readiness can succeed while workers are stale or jobs have exhausted retries.

## Follow missing telemetry

1. Verify the application exported and that the request was accepted, not rejected with `401`, `413`, `429`, or `503`.
2. Inspect ingestion activity and rejection counters for the affected period.
3. Check dependency status and worker heartbeats.
4. Find whether ingestion, materialization, evaluation, or maintenance work is waiting or failed.
5. Read the corresponding API/worker/dependency logs, repair the cause, then verify the trace/result is readable.

A waiting backlog can drain after recovery. Retained failed jobs require deliberate recovery before their history expires; they are not automatically fixed by restarting the worker. See [Troubleshooting](/lens/self-hosting/troubleshooting#telemetry-is-accepted-but-does-not-appear).

## Host collector prerequisites

Production Compose includes a private Linux host monitor with read-only host `/proc`, root, and Docker-data mounts. It does not mount the Docker socket or publish port 3100. `SYSTEM_MONITOR_DATA_PATH` defaults to `/var/lib/docker`; set it to the host's actual Docker-data path when different.

The API reaches it through `SYSTEM_MONITOR_URL` on its private network. Do not expose the monitor publicly to restore metrics. Treat host mounts, filesystem permissions, and operator access as part of the [architecture trust boundary](/lens/self-hosting/architecture).

## Choose the right health signal

- `/health/live`: the API answers HTTP.
- `/health/ready`: PostgreSQL, ClickHouse, and Redis respond.
- **System Health**: broader sampled capacity, ingestion, worker, and queue diagnostics.
- A test trace/result: verifies the actual write/materialization/read path.

Compose does not define a worker healthcheck. A running worker container is not sufficient evidence; inspect its heartbeat and job processing here.

For light hosts, use the matching [constrained profile](/lens/self-hosting/deployment#constrained-vm-profile). Persistent backlog, query memory exhaustion, or Redis admission failures require reduced load or more capacity—not simply larger request-rate limits.

Reviewed against [Lens health collection](https://github.com/anvia-hq/lens/blob/b06101f36392d4b1bab5a1b69a53d29e67fc22f5/apps/api/src/modules/system/health.ts), UI, and Compose at v0.20.0 on 2026-11-23.
