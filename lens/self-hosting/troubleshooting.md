# Troubleshooting

Follow the startup dependency chain instead of restarting every container at once. The earliest unhealthy dependency usually explains the downstream failures.

## Start with state and logs

```sh
docker compose ps
docker compose logs --tail=200 postgres clickhouse redis migrate api worker web
```

Read the first service that is unhealthy or exited unexpectedly:

```text
PostgreSQL + ClickHouse
          ↓
       migrate     Redis
          ↓          ↓
        API + worker
          ↓
         web
```

Avoid pasting a fully rendered `docker compose config` into an issue or chat: it can contain expanded secrets.

## The migration service fails

Inspect its complete log first:

```sh
docker compose logs migrate
```

Common causes are missing/invalid `LENS_ALERT_SECRET_KEY`, unavailable databases, passwords that no longer match persisted database users, insufficient storage, filesystem permissions, or a migration error.

Since v0.20.1, the runner waits for dependency readiness: PostgreSQL and ClickHouse healthchecks verify the network service, and transient failures while connecting to PostgreSQL, acquiring its migration lock, or creating ClickHouse’s migration table are retried with bounded backoff (up to 20 attempts, 500 ms initial, capped at 2 s). It does not retry every migration statement. Authentication, configuration, and SQL errors still fail immediately, so repeated readiness messages usually mean the dependency is not actually reachable or is still initializing.

Do not manually start the API against an unverified schema. If this happened during an upgrade, preserve the pre-upgrade recovery point and follow [Upgrades and backups](/lens/self-hosting/upgrades-and-backups).

## The API is live but not ready

Check both endpoints through the web origin:

```sh
curl -i https://lens.example.com/health/live
curl -i https://lens.example.com/health/ready
```

`live` only proves that the API answers HTTP. `ready` queries PostgreSQL, Redis, and ClickHouse and returns `503` with `{"status":"unavailable"}` if any dependency fails.

Inspect the API and each dependency:

```sh
docker compose logs --tail=200 api postgres clickhouse redis
```

## The page returns 502 or never loads

Confirm the `web` container is running and that the API passed its Compose readiness check:

```sh
docker compose ps web api
docker compose logs --tail=200 web api
```

If the containers are healthy, verify the external proxy target matches `WEB_PORT`. With `WEB_PORT=127.0.0.1:8080`, the host proxy should connect to `http://127.0.0.1:8080`.

## Sign-in, cookies, or redirects fail

Confirm `PUBLIC_APP_URL` and `WEB_ORIGIN` are identical to the origin in the browser, including scheme and non-default port. Ensure the proxy forwards `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto`.

If the owner already exists, public password account creation is closed; add users through invitations or configured OIDC provisioning. For SSO failures, check the [OIDC callback, token method, and admission rules](/lens/workspace/oidc). If a secret was recently rotated, restore the intended authentication secret or expect users to establish new sessions.

## Telemetry is rejected

Use the API status and logs to identify the response:

| Response or symptom | Check |
| --- | --- |
| `401` | Public and secret keys belong to the same active project key and were not revoked. |
| `413` | Exporter batch size and every proxy body limit. |
| `429` | Project-scoped request rate against `OTLP_RATE_LIMIT_PER_MINUTE`; trace/log buckets are separate. |
| `503 ingestion_busy` | Waiting ingestion backlog; honor `Retry-After: 5` and restore processing capacity. |
| `503 ingestion_unavailable` | Redis/queue admission failed, including OOM; honor `Retry-After: 5` and inspect infrastructure. |
| Browser works, exporter cannot connect | Exporter base URL, DNS, TLS trust, and network egress. |
| Short-lived process sends nothing | Exporter flush or shutdown before process exit. |

The application base URL is the public Lens origin, without an appended `/api` or OTLP route.

## Telemetry is accepted but does not appear

An accepted request still requires worker processing. Owners/admins can open [System Health](/lens/self-hosting/system-health) to inspect throughput, rejection counters, worker heartbeats, and per-queue waiting/active/failed counts. Inspect Redis, API, and worker state:

```sh
docker compose ps redis api worker
docker compose logs --tail=300 api worker redis
```

Look for queue connection failures, repeated job failures, ClickHouse write errors, or a worker that is restarting. Redis uses `noeviction` in production; when it reaches its memory or storage limit, new queue work can fail instead of silently evicting jobs.

After dependency recovery, pending/delayed work can resume, but exhausted failed jobs do not recover merely by waiting. Preserve retained failure evidence before history expires. Identical trace/log batch resubmission can retry retained failed ingestion; downstream materialization needs targeted retained-job replay by an operator. Review project state, recovery-set compatibility, and external side effects first; do not bulk-retry notifications or deletion jobs blindly. Follow the upstream [recovery procedure](https://github.com/anvia-hq/lens/blob/b06101f36392d4b1bab5a1b69a53d29e67fc22f5/docs/release-verification.md), then verify readable telemetry, not only an empty queue.

## Storage grows or fills

Check host disk usage and Docker volume storage before making retention changes. Full PostgreSQL, ClickHouse, or Redis storage can affect migrations, readiness, ingestion, and queue processing at once.

Project retention is applied asynchronously by the worker. Reducing retention is not an immediate substitute for emergency disk capacity. Add capacity or stop ingestion safely, then let maintenance complete while monitoring worker and ClickHouse logs.

Never delete database files directly from a Lens volume.

## Password-reset email fails

SMTP is disabled when `SMTP_HOST` is empty. When authentication is used, `SMTP_USER` and `SMTP_PASSWORD` must both be present. Confirm `SMTP_PORT`, `SMTP_SECURE`, sender policy, DNS, and outbound firewall access, then inspect API logs for the mail transport error.

Invitations do not send email; operators copy invitation links from the workspace UI.

## Collect a safe incident report

Record:

- pinned Lens version and Compose service state;
- affected endpoint and HTTP status;
- timestamps, project ID, trace ID, or request ID where available;
- relevant migration, API, or worker log lines;
- recent upgrade, secret, proxy, retention, or storage changes.

Remove passwords, cookies, ingestion secrets, SMTP credentials, prompt payloads, and the expanded Compose environment before sharing logs.

For a clean installation path, return to [Deployment](/lens/self-hosting/deployment). For network-only failures, use [HTTPS and networking](/lens/self-hosting/https-and-networking).
