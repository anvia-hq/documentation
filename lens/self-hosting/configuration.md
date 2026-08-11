# Configuration

The production Compose stack reads `.env` beside `docker-compose.yml`. Compose consumes image and port settings, then passes the supported runtime settings to the API, worker, migration, and tool containers.

After changing runtime configuration, reconcile the containers so they receive the new environment:

```sh
docker compose up -d
docker compose ps
```

Editing `.env` alone does not modify an already-running container.

## Images and public origin

| Variable | Default | Purpose |
| --- | --- | --- |
| `LENS_VERSION` | `latest` | Tag used for both published Lens images. Pin a release in production. |
| `LENS_PULL_POLICY` | `always` | Compose image pull behavior. |
| `LENS_BACKEND_IMAGE` | `ghcr.io/anvia-hq/lens` | Optional backend image override. |
| `LENS_WEB_IMAGE` | `ghcr.io/anvia-hq/lens-web` | Optional web image override. |
| `PUBLIC_APP_URL` | Required | Absolute browser-facing origin used by authentication and generated URLs. |
| `WEB_ORIGIN` | Required | Origin allowed to make credentialed browser API requests. |
| `WEB_PORT` | `80` | Host binding for the web service, such as `80` or `127.0.0.1:8080`. |

Set both origin values to the exact public origin, including `https` and any non-default port:

```dotenv
PUBLIC_APP_URL=https://lens.example.com
WEB_ORIGIN=https://lens.example.com
WEB_PORT=127.0.0.1:8080
```

Do not use `http://api:3001`, a Docker hostname, or a path such as `/api`. An origin mismatch commonly causes failed sign-in, rejected browser requests, incorrect redirects, or cookies that do not behave as expected.

## Required secrets

| Variable | Minimum or role |
| --- | --- |
| `POSTGRES_PASSWORD` | Password for the Lens PostgreSQL user. |
| `CLICKHOUSE_PASSWORD` | Password for the Lens ClickHouse user. |
| `REDIS_PASSWORD` | Password required by the production Redis server. |
| `BETTER_AUTH_SECRET` | Independent authentication secret, at least 32 characters. |
| `INGESTION_KEY_PEPPER` | Independent secret used to HMAC project ingestion secrets, at least 16 characters. |

Generate a unique value for each setting:

```sh
openssl rand -hex 32
```

Store the environment file in a secret manager or encrypted operator backup. Restrict host access: anyone who can read these values may be able to authenticate internal services or affect account and ingestion security.

### Rotation consequences

Do not rotate these values by editing `.env` casually:

- Database and Redis passwords in `.env` are both service credentials and client connection credentials. Existing persistent databases do not automatically change their internal user password when an environment variable changes.
- Changing `BETTER_AUTH_SECRET` can invalidate authentication material and force users to sign in again.
- Changing `INGESTION_KEY_PEPPER` makes existing project secret-key hashes unverifiable. Create and deploy replacement ingestion keys as part of a deliberate rotation.

Plan credential rotation per subsystem, preserve a recovery path, and verify access before removing the old credential.

## SMTP

| Variable | Default | Purpose |
| --- | --- | --- |
| `SMTP_HOST` | Empty | SMTP hostname; empty disables email delivery. |
| `SMTP_PORT` | `587` | SMTP server port. |
| `SMTP_SECURE` | `false` | Use TLS from connection start. |
| `SMTP_USER` | Empty | Optional SMTP username. |
| `SMTP_PASSWORD` | Empty | Optional SMTP password. |
| `SMTP_FROM` | `Anvia Lens <lens@localhost>` | Sender for Lens email. |

SMTP currently supports password-reset delivery. Invitations use links copied from the workspace UI and do not require email.

`SMTP_USER` and `SMTP_PASSWORD` must be configured together. Authenticated SMTP also requires `SMTP_HOST`. Use `SMTP_SECURE=true` when the provider expects TLS from connection start, commonly on port 465; follow the provider's instructions for STARTTLS connections.

## Ingestion and logs

| Variable | Default | Purpose |
| --- | --- | --- |
| `OTLP_MAX_BODY_BYTES` | `10485760` | Maximum accepted OTLP body size in bytes. |
| `OTLP_RATE_LIMIT_PER_MINUTE` | `600` | Request limit per ingestion credential per minute. |
| `LOG_LEVEL` | `info` | `trace`, `debug`, `info`, `warn`, `error`, or `fatal`. |

Prefer smaller exporter batches to raising the body limit. The bundled web proxy also limits request bodies to `10m`; an external proxy may impose another limit. Raising only `OTLP_MAX_BODY_BYTES` does not remove those proxy limits.

Rate limiting is applied per ingestion credential. When changing either limit, watch API rejection logs, Redis queue pressure, worker throughput, and ClickHouse load.

Use `debug` temporarily for investigation. Higher-volume logs may include operational identifiers, so route and retain them according to the same access policy as other Lens operational data.

## Development-only ports

`docker-compose.dev.yml` additionally accepts `API_PORT`, `POSTGRES_PORT`, `REDIS_PORT`, `CLICKHOUSE_HTTP_PORT`, `CLICKHOUSE_NATIVE_PORT`, `SMTP_PORT`, and `MAILPIT_UI_PORT`. Those host exposures are for development on a trusted machine and should not be copied into production Compose.

Continue with [HTTPS and networking](/lens/self-hosting/https-and-networking) for proxy configuration.
