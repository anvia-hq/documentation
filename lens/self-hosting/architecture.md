# Architecture

Lens separates synchronous HTTP work from asynchronous telemetry processing. The web service is the only public entry point; the remaining services communicate on the private Compose network.

## Services

| Service | Responsibility | Persistent state | Public host port |
| --- | --- | --- | --- |
| `web` | Serves the browser app and proxies `/api/` and `/health/` to the API | None | `WEB_PORT` |
| `api` | Authentication, workspace APIs, OTLP ingestion, and health endpoints | Uses PostgreSQL, ClickHouse, and Redis | None |
| `worker` | Persists and materializes telemetry, evaluations, alerts, retention, deletion, and cost jobs | Uses PostgreSQL, ClickHouse, and Redis | None |
| `migrate` | Applies PostgreSQL and ClickHouse migrations before application startup | Updates both databases | None |
| `postgres` | Accounts, sessions, projects, settings, credentials, managed datasets, and operational job state | `lens-postgres` | None |
| `clickhouse` | Spans, trace summaries, evaluation telemetry, and analytical data | `lens-clickhouse` | None |
| `redis` | BullMQ transport and pending background jobs | `lens-redis` with append-only persistence | None |

The production Compose file runs backend containers with a read-only root filesystem, a temporary `/tmp`, an unprivileged image user, and `no-new-privileges`. The web image uses unprivileged Nginx on container port `8080`.

## Browser request flow

```text
Browser
  └─ HTTPS request
      └─ external reverse proxy
          └─ web :8080
              ├─ static application files
              └─ /api/* ──► api :3001 ──► PostgreSQL / ClickHouse / Redis
```

The web container proxies API requests, so the browser and API share one origin. `PUBLIC_APP_URL` defines the origin used by authentication and generated links. `WEB_ORIGIN` is the allowed credentialed browser origin. They should normally be identical.

## Telemetry ingestion flow

```text
Instrumented application
  └─ OTLP request to the public Lens origin
      └─ web ──► api
                  ├─ authenticate project key
                  ├─ normalize and validate payload
                  └─ enqueue work in Redis
                           └─ worker
                               ├─ write spans and evaluations to ClickHouse
                               ├─ materialize trace summaries
                               └─ apply cost, alert, retention, and deletion work
```

An accepted ingestion request means the API validated and queued the work. The worker must remain healthy for new telemetry to appear in queries. Redis uses BullMQ jobs with retry and exponential backoff; it is operational state, not a substitute for monitoring or backups.

## Database responsibilities

PostgreSQL and ClickHouse form one application state even though they serve different workloads:

- PostgreSQL holds identity, membership, projects, settings, managed datasets, ingestion-key hashes, and job coordination records.
- ClickHouse holds high-volume runtime and evaluation telemetry optimized for analytical queries.
- Redis carries background work between the API and worker and preserves pending jobs through append-only persistence.

Back up and restore them as one recovery set. Restoring only PostgreSQL can recover accounts and settings while leaving trace data absent. Restoring only ClickHouse can leave telemetry without matching projects or access configuration.

## Startup and migrations

The migration container waits for PostgreSQL and ClickHouse health checks. It applies Drizzle migrations to PostgreSQL, then applies unapplied ordered SQL migrations to ClickHouse and records them in `schema_migrations`.

The API and worker do not start until the migration container completes successfully. This prevents a new application image from serving against a known outdated schema.

Never bypass a failing migration by manually starting downstream services. Preserve the error and the pre-upgrade recovery point, then correct the cause or restore the matching backup.

## Health endpoints

| Endpoint | Meaning |
| --- | --- |
| `/health/live` | The API process can answer HTTP. |
| `/health/ready` | PostgreSQL, ClickHouse, and Redis respond to dependency checks. |
| `/internal/metrics` | API ingestion metrics for an internal collector. |

The web service proxies `/health/` but does not proxy `/internal/metrics`. Collect internal metrics from a trusted path inside the deployment network; do not publish the API solely to expose metrics.

Read [HTTPS and networking](/lens/self-hosting/https-and-networking) for the intended trust boundary, or [Upgrades and backups](/lens/self-hosting/upgrades-and-backups) for state protection.
