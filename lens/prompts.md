# Prompt management

Lens stores text and chat prompts as immutable numeric versions. Deploy or roll back by moving a label such as `production`; committing a new version alone does not change what applications retrieve.

Use **Prompts** in the project sidebar. Workspace members can inspect prompts; owners and admins can create, commit versions, move labels, edit descriptions, and archive them.

## Create a prompt

1. Select **Create prompt** and enter a stable name such as `support/answer`.
2. Choose **Text template** or **Chat messages**.
3. Supply the template or ordered messages, an optional description, and a change message.
4. Add an optional **Config (JSON object)** for application-owned model settings or other versioned configuration.
5. Choose initial labels deliberately, then create the prompt.

For a text template, an example is:

```text
Answer the support question using the policy: {{question}}
```

Chat prompts contain ordered `system`, `user`, `assistant`, or `tool` messages. Templates use named string variables such as `{{question}}`. Compilation is performed by the SDK, not by Lens executing a model call.

A prompt name is at most 128 characters. Text templates must contain non-whitespace content; chat prompts require at least one message. Config must be a JSON object. Review templates and configuration for sensitive data before storing them.

## Commit the next version

Open the prompt and select **New version**. Review its text/messages and config, add a meaningful change message, and commit it. Existing version content remains immutable; descriptions and label assignments are separate management operations.

Unlike a managed dataset, a prompt does not have an editable draft/publish lifecycle. Each commit creates a numeric version. Record the resolved version used by an application, not merely the label it requested.

## Deploy and roll back

In the prompt detail's **Labels** section, move a label to the intended numeric version. The default runtime selector is `production`, not the latest committed version.

```text
v1 committed ← production
v2 committed ← staging
        ↓ move production to v2
v1 retained
v2 committed ← production, staging
```

Move `production` back to `v1` to roll back. Deployment history records the label, previous and new versions, actor, and timestamp. A numeric-version request stays pinned regardless of later label changes.

Application prompt caches can delay observation of a label move. The SDK defaults to a 60-second cache TTL; use its documented reload/cache controls when freshness is part of a release check. Moving a label does not restart an application or change application-owned model configuration automatically.

## Retrieve and attribute a version

Applications use the same project public/secret pair as telemetry ingestion. That public API retrieves prompts but cannot author or move labels.

Follow [Versioned prompts in Anvia](/lens/connect/anvia/versioned-prompts) to retrieve and compile a snapshot. Pass its resolved `ref` explicitly:

- `trace.promptRef` for Agent or Pipeline tracing;
- `run.promptRef` for evaluation-run identity.

Fetching and compiling do not set a global current prompt. Safe trace capture keeps prompt identity without newly exporting template bodies or compilation variables.

## Archive a prompt

Select **Archive** when new applications should no longer retrieve it. Archived prompts leave the active list and public retrieval while retaining versions and deployment history. Existing cached snapshots can remain usable until refresh; move consumers before archiving.

Use [Compare releases](/lens/evaluations/compare) to inspect evaluation prompt-name/version warnings. Gates do not automatically require prompt equality.

## Reviewed source

Reviewed against [Lens v0.20.0 prompt contracts](https://github.com/anvia-hq/lens/blob/b06101f36392d4b1bab5a1b69a53d29e67fc22f5/packages/contracts/src/prompts.ts) and its prompt UI/API on 2026-11-23. See the [Lens server baseline](/lens/#reviewed-baselines) for server-versus-SDK version boundaries.
