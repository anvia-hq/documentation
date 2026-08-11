# Ingestion keys

An ingestion key pair lets a server send telemetry to one Lens project. It is not a Lens user account and does not grant browser access to project data.

Key management requires the `owner` or `admin` workspace role.

## Create a key

Open the target project's **Settings** page. Under **Ingestion keys**, enter a name such as `Production API` and select **Create key**.

Lens returns two values:

```dotenv
ANVIA_LENS_PUBLIC_KEY=pk-lens-...
ANVIA_LENS_SECRET_KEY=sk-lens-...
```

The public key identifies the project. The secret authenticates ingestion. Copy both before closing the reveal panel: the secret is returned only when the key is created and Lens stores a keyed hash rather than a recoverable copy.

Keep the secret in a server-side secret manager. Do not place it in browser code, commit it to source control, print it in build logs, or include it in screenshots.

## Connect the application

Set the pair together with the Lens origin in the process that emits telemetry:

```dotenv
ANVIA_LENS_BASE_URL=https://lens.example.com
ANVIA_LENS_PUBLIC_KEY=pk-lens-...
ANVIA_LENS_SECRET_KEY=sk-lens-...
```

Both values must come from the same active key pair. A public key from one row and secret from another will fail authentication.

Follow [Anvia SDK setup](/lens/connect/anvia/configure-tracing) or [Langfuse setup](/lens/connect/langfuse/connect-existing-instrumentation) for integration-specific variables.

## Name keys by deployment

Use names that reveal where a credential is installed:

- `Production API`
- `Staging worker`
- `Local development — Indra`

Avoid one shared key across unrelated services. Separate keys allow one deployment to be revoked without interrupting the others and make the **Last used** value useful during investigation.

## Rotate without interruption

Use an overlapping rotation:

1. Create a replacement key with a name that identifies the new deployment or rotation date.
2. Store the new pair in the application's secret manager.
3. Deploy or restart every process that used the old pair.
4. Generate telemetry and confirm the replacement key shows recent use.
5. Revoke the old key.

Do not revoke first unless ingestion must stop immediately. Revocation takes effect immediately and cannot be undone.

## Revoke a key

Select the revoke action beside the active key and confirm. Existing telemetry remains in the project, but new writes using that pair are rejected.

Revoked keys disappear from the active-key list in the current interface. Create a new key if access is needed again; a revoked pair cannot be reactivated.

Revoke a key when:

- its secret may have been exposed;
- a workload has been retired;
- responsibility for a deployment changes;
- a rotation has been verified;
- a former operator could still access the deployed secret.

Deleting the project revokes all of its keys automatically. Read [Retention and deletion](/lens/workspace/project-settings/retention-and-deletion) before using that broader action.
