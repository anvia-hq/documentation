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

Common causes are unavailable databases, passwords that no longer match persisted database users, insufficient storage, filesystem permissions, or a migration error.

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

If the owner already exists, public account creation is closed; add users through invitations. If a secret was recently rotated, restore the intended authentication secret or expect users to establish new sessions.

## Telemetry is rejected

Use the API status and logs to identify the response:

| Response or symptom | Check |
| --- | --- |
| `401` | Public and secret keys belong to the same active project key and were not revoked. |
| `413` | Exporter batch size and every proxy body limit. |
| `429` | Per-credential request rate against `OTLP_RATE_LIMIT_PER_MINUTE`. |
| Browser works, exporter cannot connect | Exporter base URL, DNS, TLS trust, and network egress. |
| Short-lived process sends nothing | Exporter flush or shutdown before process exit. |

The application base URL is the public Lens origin, without an appended `/api` or OTLP route.

## Telemetry is accepted but does not appear

An accepted request still requires worker processing. Inspect Redis, API, and worker state:

```sh
docker compose ps redis api worker
docker compose logs --tail=300 api worker redis
```

Look for queue connection failures, repeated job failures, ClickHouse write errors, or a worker that is restarting. Redis uses `noeviction` in production; when it reaches its memory or storage limit, new queue work can fail instead of silently evicting jobs.

After the worker recovers, allow queued jobs time to process, then clear trace filters and search a recent time range.

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
