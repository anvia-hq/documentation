# Deployment

Deploy Lens from its published images with the production Compose file. A source checkout is not required.

This path gives Lens persistent named volumes, dependency-aware startup, a one-shot migration service, health checks, and a private network for every service except the web entry point.

## Prerequisites

Prepare a Linux host or VM with:

- Docker Engine and the Docker Compose plugin;
- persistent local or provider-backed storage for three named volumes;
- enough CPU, memory, and disk for your telemetry volume;
- a domain and HTTPS reverse proxy for an internet-facing deployment;
- an operational backup destination outside the Docker host.

Capacity depends on trace volume, payload size, retention, and query activity. Start conservatively, then measure host memory, disk growth, ClickHouse query latency, and queue delay.

## Download the release configuration

This example uses the published [Lens v0.20.1 release](https://github.com/anvia-hq/lens/releases/tag/v0.20.1), checked on 2026-11-23. Download configuration from the same release ref as the images; do not pair moving `main` assets with an older image tag. The release adds deployment/startup fixes, so an existing v0.20.0 installation should also adopt the v0.20.1 Compose healthchecks rather than changing only `LENS_VERSION`; see [Upgrades and backups](/lens/self-hosting/upgrades-and-backups).

Create a dedicated directory and download the production files:

```sh
mkdir lens
cd lens
curl -fsSLO https://raw.githubusercontent.com/anvia-hq/lens/v0.20.1/docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/anvia-hq/lens/v0.20.1/.env.example -o .env
```

Keep both files under change control, but never commit the populated `.env` file.

## Configure the installation

Pin the reviewed numeric release tag and set the exact browser-facing origin. Tags are not content digests; record image digests when your recovery policy requires immutable artifacts:

```dotenv
LENS_VERSION=0.20.1

PUBLIC_APP_URL=https://lens.example.com
WEB_ORIGIN=https://lens.example.com
WEB_PORT=127.0.0.1:8080
```

Generate a different value for each required secret:

```sh
openssl rand -hex 32
```

```dotenv
POSTGRES_PASSWORD=replace-with-a-random-value
CLICKHOUSE_PASSWORD=replace-with-a-different-random-value
REDIS_PASSWORD=replace-with-another-random-value
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
INGESTION_KEY_PEPPER=replace-with-an-independent-random-value
LENS_ALERT_SECRET_KEY=replace-with-key-id-and-base64-of-32-random-bytes
```

For `LENS_ALERT_SECRET_KEY`, generate an independent 32-byte key with an explicit ID:

```sh
printf 'lens-key-1:%s\n' "$(openssl rand -base64 32)"
```

Paste this output into the alert-key setting. Do not reuse one value across services. Database credentials, the authentication secret, and the ingestion-key pepper have different rotation and recovery consequences. See [Configuration](/lens/self-hosting/configuration) before rotating an existing installation.

## Constrained VM profile

For low-volume deployments, download the matching resource override:

```sh
curl -fsSLO https://raw.githubusercontent.com/anvia-hq/lens/v0.20.1/docker-compose.small.yml
docker compose -f docker-compose.yml -f docker-compose.small.yml up -d
```

Use both `-f` files for every subsequent Compose command, including `pull`, `logs`, and `down`. The profile caps steady-state container memory at roughly 3.3 GiB, sets Redis data `maxmemory` to 192 MiB with `noeviction`, limits ClickHouse queries to two threads and 384 MiB, accepts OTLP bodies up to 2 MiB, and returns retryable `503` when 500 ingestion jobs are waiting. It also reduces worker concurrency and retained queue history.

A 2-vCPU/4-GB host is a starting point for light workloads, not a capacity guarantee. Start with the supported 7-day retention option and monitor [System Health](/lens/self-hosting/system-health). Persistent backlogs, rejected Redis writes, or exhausted query memory call for reduced load or more capacity. See [Configuration](/lens/self-hosting/configuration#capacity-and-queue-history) for individual controls.

## Start Lens

Pull and start the stack:

```sh
docker compose pull
docker compose up -d
docker compose ps
```

Startup follows this dependency order:

1. PostgreSQL and ClickHouse become healthy.
2. `migrate` applies both database migration sets and exits successfully.
3. The API starts after migrations and Redis are ready.
4. The worker starts after migrations and Redis are ready.
5. The web service starts after the API readiness check succeeds.

The completed `migrate` container remaining in an exited state is normal. It should report exit code `0`.

Inspect startup if any service exits unexpectedly or an expected healthcheck fails:

```sh
docker compose ps
docker compose logs --tail=200 migrate api worker web
```

## Create the owner

Open the configured public origin. The first account created becomes the workspace owner, and public account creation closes after that owner exists. Later users join through invitations or optional [OIDC domain provisioning](/lens/workspace/oidc). Owner bootstrap still uses the password setup form, even when ordinary password login is disabled.

Protect the owner account and make account recovery part of the deployment runbook. Configure SMTP if the installation must deliver password-reset email.

## Verify the deployment

Confirm the public liveness and readiness endpoints:

```sh
curl -fsS https://lens.example.com/health/live
curl -fsS https://lens.example.com/health/ready
```

Expected responses are:

```json
{ "status": "ok" }
```

```json
{ "status": "ready" }
```

Readiness checks PostgreSQL, ClickHouse, and Redis. It does not prove that the worker is processing jobs, so also open owner/admin [System Health](/lens/self-hosting/system-health), review worker logs, and send a test trace from a non-production project.

## Stop without deleting data

```sh
docker compose down
```

This removes containers and the Compose network while preserving named volumes.

::: danger Never add `-v` to a routine stop or restart
`docker compose down -v` permanently deletes Lens's PostgreSQL, ClickHouse, and Redis volumes. Do not use it for upgrades, troubleshooting, or configuration changes.
:::

Continue with [HTTPS and networking](/lens/self-hosting/https-and-networking) before exposing Lens beyond a trusted local network.
