# Project settings

Project settings controls how applications write telemetry, how long telemetry is retained, and whether the project continues to exist. These settings apply only to the active project.

Creating or revoking keys, changing retention, and deleting a project requires the `owner` or `admin` workspace role.

## Open the correct project

Select the project from the project rail, then open **Settings** in its sidebar. Confirm the project name in the page description before making a change.

Project settings has three responsibilities:

| Area | Use it to |
| --- | --- |
| Ingestion keys | Create server-side credentials, verify recent use, rotate access, and revoke old keys. |
| Data retention | Keep telemetry for 7, 30, 90 days, or without a time limit. |
| Danger zone | Permanently delete the project and everything it owns. |

## Ingestion keys

Each key pair authenticates writes to one project. The public key identifies the destination and the secret proves that the sender may ingest into it.

The secret is shown only once. If it is lost, create a replacement—Lens cannot reveal it later. Prefer one named key per independently deployed workload so rotation does not interrupt unrelated senders.

See [Ingestion keys](/lens/workspace/project-settings/ingestion-keys) for creation, deployment, and zero-downtime rotation.

## Retention and deletion

Retention controls telemetry lifetime; it does not archive or delete the project itself. A change is reconciled asynchronously, and shortening the period can make existing records eligible for removal.

Project deletion is different: ingestion stops immediately, then the worker permanently removes project telemetry and configuration. There is no restore action.

See [Retention and deletion](/lens/workspace/project-settings/retention-and-deletion) before shortening retention or entering the danger zone.

## Separate workspace administration

Project settings does not manage user access. Membership and roles apply across all projects and live under the workspace's **Members** page.

Go to [Members and roles](/lens/workspace/members-and-roles) when the goal is granting or removing human access. Revoke an ingestion key when the goal is stopping an application from sending telemetry.
