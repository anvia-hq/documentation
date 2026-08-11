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

Create a dedicated directory and download the production files:

```sh
mkdir lens
cd lens
curl -fsSLO https://raw.githubusercontent.com/anvia-hq/lens/main/docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/anvia-hq/lens/main/.env.example -o .env
```

Keep both files under change control, but never commit the populated `.env` file.

## Configure the installation

Pin an immutable release and set the exact browser-facing origin:

```dotenv
LENS_VERSION=0.4.1

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
```

Do not reuse one value across services. Database credentials, the authentication secret, and the ingestion-key pepper have different rotation and recovery consequences. See [Configuration](/lens/self-hosting/configuration) before rotating an existing installation.

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

Inspect startup if any long-running service does not become healthy:

```sh
docker compose ps
docker compose logs --tail=200 migrate api worker web
```

## Create the owner

Open the configured public origin. The first account created becomes the workspace owner, and public account creation closes after that owner exists. Later users join through workspace invitations.

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

Readiness checks PostgreSQL, ClickHouse, and Redis. It does not prove that the worker is processing jobs, so also review worker logs and send a test trace from a non-production project.

## Stop without deleting data

```sh
docker compose down
```

This removes containers and the Compose network while preserving named volumes.

::: danger Never add `-v` to a routine stop or restart
`docker compose down -v` permanently deletes Lens's PostgreSQL, ClickHouse, and Redis volumes. Do not use it for upgrades, troubleshooting, or configuration changes.
:::

Continue with [HTTPS and networking](/lens/self-hosting/https-and-networking) before exposing Lens beyond a trusted local network.
