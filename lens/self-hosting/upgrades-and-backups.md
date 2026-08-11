# Upgrades and backups

A Lens upgrade changes application images and may change PostgreSQL or ClickHouse schemas. Treat the images, all three data stores, and installation secrets as one versioned recovery set.

## What to protect

The production Compose stack persists:

| Volume | Contains |
| --- | --- |
| `lens-postgres` | Accounts, sessions, workspace and project configuration, keys, datasets, and operational records. |
| `lens-clickhouse` | Traces, spans, evaluation telemetry, summaries, and analytics. |
| `lens-redis` | Durable BullMQ queue state and pending background work. |

Also protect, separately and encrypted:

- the populated `.env` file or equivalent secret-manager values;
- `docker-compose.yml` used for the deployment;
- the pinned `LENS_VERSION`;
- reverse-proxy and certificate configuration;
- a short restore runbook for the storage platform.

Without the original `INGESTION_KEY_PEPPER`, existing ingestion secret hashes cannot be verified. Without database passwords, restored services cannot reconnect. A volume-only backup is therefore incomplete.

## Create a consistent recovery point

Use snapshots or backups supported by the host or storage provider. For a simple single-host Compose deployment, the safest generic procedure is a cold recovery point:

1. Announce an ingestion maintenance window or stop exporters.
2. Stop Lens so no API or worker writes remain in flight.
3. Snapshot or copy all three named volumes as one recovery point.
4. Back up the matching configuration and secrets separately.
5. Restart the current version and verify readiness.

```sh
docker compose stop
```

Identify the actual Docker volume names before copying them; Compose may prefix logical volume keys with its project name. Storage-level copies of database files must be taken while PostgreSQL, ClickHouse, and Redis are stopped unless the storage platform explicitly guarantees application-consistent snapshots.

After the backup finishes:

```sh
docker compose start
docker compose ps
```

For installations that cannot tolerate a cold backup window, use database-native backup tooling and a coordinated recovery design. A PostgreSQL dump alone is not a complete Lens backup because most telemetry lives in ClickHouse.

Test restoration into an isolated environment. Confirm sign-in, projects, a historical trace, an evaluation result, and ingestion before accepting the backup procedure.

::: danger Volume deletion is permanent
Never run `docker compose down -v`, `docker volume rm` for a Lens volume, or a volume-pruning command as part of an upgrade or restart. These operations can permanently erase Lens data.
:::

## Upgrade a pinned release

Before upgrading:

1. Read the target release notes.
2. Record the currently running `LENS_VERSION`.
3. Confirm `docker compose ps` is healthy.
4. Create and verify a recovery point.
5. Avoid concurrent retention changes, project deletion, or cost recalculation.

Change only `LENS_VERSION` to the target release, then pull and reconcile the stack:

```sh
docker compose pull
docker compose up -d
docker compose ps
```

The new `migrate` container waits for PostgreSQL and ClickHouse, applies unapplied migrations, and must exit successfully before the API or worker starts.

## Verify the upgrade

Review migration and application logs:

```sh
docker compose logs migrate
docker compose logs --tail=200 api worker web
```

Then verify:

- `/health/live` and `/health/ready` return successfully;
- an operator can sign in and open a representative project;
- historical trace and evaluation data is present;
- a new test trace is accepted and appears after worker processing;
- alerts, datasets, and cost settings needed by your workflow still load.

## Handle a failed migration

Do not bypass the migration dependency or repeatedly restart the full stack. Preserve the migration logs and keep the affected application services stopped.

Changing the image tag back is not necessarily a rollback: an applied database migration may not be compatible with the older image. Restore the matching pre-upgrade recovery set unless the release notes explicitly describe a safe downgrade path.

## Restore principles

- Restore PostgreSQL, ClickHouse, and Redis from the same recovery point.
- Restore the matching `.env`, Compose file, and application version.
- Keep the restored stack isolated until its database and authentication state is verified.
- Do not connect production exporters until migrations, readiness, and worker processing are confirmed.
- Preserve the failed environment until the incident is understood.

Continue with [Troubleshooting](/lens/self-hosting/troubleshooting) when a service or migration does not recover cleanly.
