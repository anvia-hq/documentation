# Install and setup

Set up Lens in two parts: deploy the Lens workspace, then create project credentials for the server that will send telemetry.

For a local evaluation, Docker with Compose support is enough. A production deployment should use a pinned Lens release, unique secrets, persistent volumes, and an HTTPS reverse proxy.

## Run Lens locally

Download the production Compose file and environment template into a dedicated directory:

```sh
mkdir lens
cd lens
curl -fsSLO https://raw.githubusercontent.com/anvia-hq/lens/v0.20.0/docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/anvia-hq/lens/v0.20.0/.env.example -o .env
```

For local use, set the public origin and generate a different value for every secret:

```dotenv
LENS_VERSION=0.20.0
PUBLIC_APP_URL=http://localhost
WEB_ORIGIN=http://localhost
WEB_PORT=80

POSTGRES_PASSWORD=replace-with-a-random-value
CLICKHOUSE_PASSWORD=replace-with-a-random-value
REDIS_PASSWORD=replace-with-a-random-value
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
INGESTION_KEY_PEPPER=replace-with-an-independent-random-value
LENS_ALERT_SECRET_KEY=replace-with-key-id-and-base64-of-32-random-bytes
```

Generate the database, authentication, and pepper values independently with `openssl rand -hex 32`. Generate the alert encryption key separately with `printf 'lens-key-1:%s\n' "$(openssl rand -base64 32)"` and paste the output into `LENS_ALERT_SECRET_KEY`. It requires an explicit key ID and 32-byte key; leaving the template placeholder prevents migration. See [secret rotation](/lens/self-hosting/upgrades-and-backups#rotate-alert-channel-encryption).

Start the services:

```sh
docker compose up -d
docker compose ps
```

Open `http://localhost`. The first person to create an account becomes the workspace owner; public account creation closes after that owner exists.

Lens exposes only its web entry point in the production Compose stack. PostgreSQL, ClickHouse, Redis, the API, worker, and host monitor remain private. See [Architecture](/lens/self-hosting/architecture) for the monitor’s read-only host mounts.

## Create a project

A project separates telemetry, evaluations, datasets, credentials, and retention from other applications.

After creating the workspace owner:

1. Create the first project and choose a recognizable application name.
2. Open **Connect** for that project.
3. Create an ingestion key such as `Local development`.
4. Copy both the public and secret keys immediately.

The public key identifies the project. The secret key authenticates ingestion and supported project public APIs, including dataset and prompt reads and quality-gate checks, and is shown only once. Keep both in the server environment, never in browser code.

## Install the application integration

In the project that runs your Anvia agent:

```sh
pnpm add @anvia/lens
```

Configure the Lens origin and the project key pair:

```dotenv
ANVIA_LENS_BASE_URL=http://localhost
ANVIA_LENS_PUBLIC_KEY=pk-lens-...
ANVIA_LENS_SECRET_KEY=sk-lens-...
ANVIA_LENS_SERVICE_NAME=support-agent
ANVIA_LENS_ENVIRONMENT=development
```

| Variable | Purpose |
| --- | --- |
| `ANVIA_LENS_BASE_URL` | The browser-facing Lens origin. Do not append `/api` or an OTLP path. |
| `ANVIA_LENS_PUBLIC_KEY` | Selects the Lens project. |
| `ANVIA_LENS_SECRET_KEY` | Authenticates ingestion for that project. |
| `ANVIA_LENS_SERVICE_NAME` | Gives the emitting service a stable name. |
| `ANVIA_LENS_ENVIRONMENT` | Separates traffic such as development, staging, and production. |

The public and secret keys must belong to the same active key pair.

## Verify the Lens stack

If the UI does not open, inspect the one-shot migration and the long-running services:

```sh
docker compose ps
docker compose logs --tail=100 migrate api worker web
```

The `migrate` service should exit with code `0`; the databases, Redis, API, and web services should become healthy. The worker has no Compose healthcheck: confirm it is running, then use owner/admin [System Health](/lens/self-hosting/system-health) to verify its heartbeat and queue processing.

At this point the workspace is ready to receive telemetry. Continue with [Your first trace](/lens/your-first-trace).

## Local Lens development

When working on the Lens repository itself, use its development stack instead of the release Compose file:

```sh
cp .env.dev.example .env
docker compose -f docker-compose.dev.yml up --build
```

Open Lens at `http://localhost` and Mailpit at `http://localhost:8025`. Load a realistic local workspace after migrations finish:

```sh
docker compose -f docker-compose.dev.yml run --rm seed
```

This development stack exposes infrastructure ports intentionally. Do not use it as the production deployment topology.

## Before production

- Set `PUBLIC_APP_URL` and `WEB_ORIGIN` to the same exact HTTPS origin.
- Pin `LENS_VERSION` instead of following `latest`.
- Bind the Lens web port to a private host address and terminate HTTPS at a reverse proxy.
- Back up the PostgreSQL, ClickHouse, and Redis volumes.
- Configure project retention and restrict workspace membership.
- Never publish the API, databases, or Redis directly to the internet.

Deployment, networking, upgrades, and backups are covered under [Self-hosting](/lens/self-hosting/deployment).
