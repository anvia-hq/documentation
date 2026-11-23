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
| `INGESTION_KEY_PEPPER` | Independent HMAC pepper for project keys and MCP tokens, at least 16 characters. |
| `LENS_ALERT_SECRET_KEY` | AES-256-GCM keyring for alert-channel secrets; explicit key ID plus 32-byte base64/hex key. Required in production. |

Generate unique database/authentication/pepper values:

```sh
openssl rand -hex 32
```

Generate the alert key independently with `printf 'lens-key-1:%s\n' "$(openssl rand -base64 32)"`. Paste the output into `.env`; shell substitution is not a literal `.env` value. For rotation, the first `id:key` is active and later comma-separated keys decrypt old rows. See [Rotate alert-channel encryption](/lens/self-hosting/upgrades-and-backups#rotate-alert-channel-encryption).

Store the environment file in a secret manager or encrypted operator backup. Restrict host access: anyone who can read these values may be able to authenticate internal services or affect account and ingestion security.

### Rotation consequences

Do not rotate these values by editing `.env` casually:

- Database and Redis passwords in `.env` are both service credentials and client connection credentials. Existing persistent databases do not automatically change their internal user password when an environment variable changes.
- Changing `BETTER_AUTH_SECRET` can invalidate authentication material and force users to sign in again.
- Changing `INGESTION_KEY_PEPPER` makes existing project-key and MCP-token hashes unverifiable. Plan replacement credentials before rotating it.
- Removing an alert encryption key before re-encrypting stored channels makes their secrets unreadable; preserve the old key through the rotation runbook.

Plan credential rotation per subsystem, preserve a recovery path, and verify access before removing the old credential.

## OIDC and password login

See [OIDC and SSO](/lens/workspace/oidc) for provider registration, invitation/provisioning behavior, and recovery. These are deployment settings, not workspace UI toggles.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PASSWORD_LOGIN_ENABLED` | `true` | Ordinary password login; owner bootstrap remains available on fresh installs. |
| `OIDC_ENABLED` | `false` | Enable the configured OpenID Connect provider. |
| `OIDC_PROVIDER_ID` | `oidc` | Provider identifier used in the callback URL. |
| `OIDC_DISPLAY_NAME` | `Company SSO` | Sign-in button label. |
| `OIDC_DISCOVERY_URL` | Empty | Discovery document URL; required when enabled. |
| `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` | Empty | Registered client credentials; required when enabled. |
| `OIDC_SCOPES` | `openid profile email` | Space/comma-separated scopes; must include `openid`. |
| `OIDC_REQUIRE_ISSUER_VALIDATION` | `false` | Require provider issuer validation. |
| `OIDC_TOKEN_ENDPOINT_AUTH` | `auto` | Discovery-based method with Basic fallback; `basic` or `post` overrides it. |
| `OIDC_REQUIRE_VERIFIED_EMAIL` | `false` | Require verified email during invitation/provisioning admission; not an offboarding control for existing memberships. |
| `OIDC_AUTO_PROVISION` | `false` | Admit qualifying verified-domain users as members. |
| `OIDC_ALLOWED_DOMAINS` | Empty | Exact email domains, space/comma-separated; required for auto-provisioning. |

Keep password login enabled until SSO works. Disabling both password login and OIDC fails configuration validation.

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
| `OTLP_RATE_LIMIT_PER_MINUTE` | `600` | Project-scoped requests per fixed minute; trace and evaluation-log endpoints use separate buckets. |
| `LOG_LEVEL` | `info` | `trace`, `debug`, `info`, `warn`, `error`, or `fatal`. |

Prefer smaller exporter batches to raising the body limit. The bundled web proxy also limits request bodies to `10m`; an external proxy may impose another limit. Raising only `OTLP_MAX_BODY_BYTES` does not remove those proxy limits.

Multiple credentials for one project share each endpoint’s bucket; rotating/adding keys does not add capacity. When changing either limit, watch API rejection logs, Redis queue pressure, worker throughput, and ClickHouse load.

Use `debug` temporarily for investigation. Higher-volume logs may include operational identifiers, so route and retain them according to the same access policy as other Lens operational data.

## Capacity and queue history

The [constrained profile](/lens/self-hosting/deployment#constrained-vm-profile) overrides these defaults. Zero disables the optional ClickHouse/backlog limits; worker concurrency, pool size, and retained-history values must be positive. `MATERIALIZE_DELAY_MS` permits zero.

| Variable | Default | Purpose |
| --- | --- | --- |
| `POSTGRES_MAX_CONNECTIONS` | `10` | Per-process database pool size. |
| `CLICKHOUSE_MAX_THREADS` | `0` | Optional query thread cap. |
| `CLICKHOUSE_MAX_MEMORY_USAGE_BYTES` | `0` | Optional per-query memory cap. |
| `CLICKHOUSE_MAX_BYTES_BEFORE_EXTERNAL_GROUP_BY` | `0` | Spill threshold for grouping. |
| `CLICKHOUSE_MAX_BYTES_BEFORE_EXTERNAL_SORT` | `0` | Spill threshold for sorting. |
| `INGESTION_QUEUE_MAX_WAITING` | `0` | Waiting ingestion-job admission limit; saturation returns retryable `503`. |
| `WORKER_INGEST_CONCURRENCY` | `8` | Concurrent ingestion jobs. |
| `WORKER_MATERIALIZE_CONCURRENCY` | `8` | Concurrent trace-summary jobs. |
| `WORKER_EVALUATION_CONCURRENCY` | `8` | Concurrent evaluation jobs. |
| `MATERIALIZE_DELAY_MS` | `1500` | Coalescing delay for trace-summary reads. |
| `QUEUE_RETAIN_COMPLETED_AGE_SECONDS` | `3600` | Completed-job history age. |
| `QUEUE_RETAIN_COMPLETED_COUNT` | `10000` | Completed-job history count. |
| `QUEUE_RETAIN_FAILED_AGE_SECONDS` | `604800` | Failed-job history age. |
| `QUEUE_RETAIN_FAILED_COUNT` | `10000` | Failed-job history count. |
| `MCP_RATE_LIMIT_PER_MINUTE` | `120` | Requests per MCP token per fixed minute. |
| `SYSTEM_MONITOR_DATA_PATH` | `/var/lib/docker` | Compose host filesystem mount used to measure Docker-data disk capacity. |

Retained queue history is not telemetry retention. Failed jobs need diagnosis/replay before their history expires. Inspect [System Health](/lens/self-hosting/system-health) before changing limits.

## Development-only ports

`docker-compose.dev.yml` additionally accepts `API_PORT`, `POSTGRES_PORT`, `REDIS_PORT`, `CLICKHOUSE_HTTP_PORT`, `CLICKHOUSE_NATIVE_PORT`, `SMTP_PORT`, and `MAILPIT_UI_PORT`. Those host exposures are for development on a trusted machine and should not be copied into production Compose.

Continue with [HTTPS and networking](/lens/self-hosting/https-and-networking) for proxy configuration.
