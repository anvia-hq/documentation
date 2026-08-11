# Self-hosting

Self-host Lens when telemetry, evaluation data, and workspace administration must remain in infrastructure you control. The supported production starting point is the release `docker-compose.yml`: it runs the Lens web application, API, worker, migrations, PostgreSQL, ClickHouse, and Redis as one private stack.

Self-hosting also makes you responsible for HTTPS, secrets, storage capacity, backups, upgrades, and incident response. Decide who owns those tasks before sending production telemetry.

## Choose the right stack

| Goal | Use |
| --- | --- |
| Run a stable Lens installation | Published images with `docker-compose.yml` |
| Develop Lens itself | Source checkout with `docker-compose.dev.yml` |
| Author only the Lens documentation site | `pnpm www:dev` in the Lens repository |

The development Compose file exposes the API, databases, Redis, and Mailpit on host ports and uses development credentials. It is convenient on a trusted workstation, but it is not a production topology.

## What you operate

```text
Browser and telemetry exporters
              │ HTTPS
              ▼
       reverse proxy or load balancer
              │
              ▼
        Lens web entry point
              │ private network
              ▼
             API ───── Redis queues ───── Worker
              │                            │
              ├──────── PostgreSQL ────────┤
              └──────── ClickHouse ────────┘
```

Only the web entry point should be reachable from outside the stack. The API, worker, PostgreSQL, ClickHouse, and Redis are internal services.

## Self-hosting guide

| Page | Use it to |
| --- | --- |
| [Deployment](/lens/self-hosting/deployment) | Install and start a pinned production release. |
| [Architecture](/lens/self-hosting/architecture) | Understand service responsibilities and data flow. |
| [Configuration](/lens/self-hosting/configuration) | Configure origins, secrets, SMTP, ingestion limits, and logs. |
| [HTTPS and networking](/lens/self-hosting/https-and-networking) | Publish the web endpoint without exposing private services. |
| [Upgrades and backups](/lens/self-hosting/upgrades-and-backups) | Protect state, run migrations, and plan rollback. |
| [Troubleshooting](/lens/self-hosting/troubleshooting) | Diagnose startup, authentication, ingestion, and worker failures. |

## Production baseline

Before calling an installation production-ready:

- pin `LENS_VERSION` to a published release;
- generate an independent value for every secret;
- serve the browser-facing origin over HTTPS;
- expose only the Lens web service;
- keep the Compose environment file out of source control;
- monitor service state, storage, API readiness, and worker logs;
- back up PostgreSQL, ClickHouse, Redis, and the secrets needed to read them;
- test restoration before relying on the backup.

Start with [Deployment](/lens/self-hosting/deployment). If Lens is already running, read [Upgrades and backups](/lens/self-hosting/upgrades-and-backups) before changing its image version or storage.
