# Workspace

The Lens workspace is the administrative boundary around your projects and the people who can open them. Create membership once at workspace level, then use projects to separate telemetry, credentials, evaluations, and retention.

Lens currently creates one organization for an installation. In the product, **workspace** refers to that organization and its shared administration.

## Understand the two scopes

| Scope | Contains | Who receives access |
| --- | --- | --- |
| Workspace | Accounts, roles, invitations, projects, and shared model-cost settings | Every workspace member |
| Project | Telemetry, evaluations, datasets, alerts, ingestion keys, and retention | Every member of the parent workspace |

Project boundaries isolate data and configuration, but they are not separate access-control groups. Adding someone to the workspace gives them access to every project in it. If two groups must not see each other's data, they need separate Lens installations with the current permission model.

## Choose where to work

Use the Lens mark at the top of the project rail to return to workspace navigation. From there:

- **Projects** opens the project directory and lets owners or admins create another project.
- **Members** shows everyone who can access the workspace and its projects.
- **Cost Settings** configures model pricing shared across the workspace.

Inside a project, **Settings** controls only that project's ingestion credentials, retention, and deletion.

```text
Workspace
├── Members and roles
├── Shared cost settings
└── Projects
    ├── Project A: telemetry, keys, retention
    └── Project B: telemetry, keys, retention
```

## Decide how to organize projects

Create another project when applications require separate credentials, data, or retention. Common boundaries are products, tenants, teams with the same workspace access, or different data classifications.

Do not create a project only to distinguish `development`, `staging`, and `production` when the same people should investigate them together. Send an `environment` value with telemetry and filter it inside one project instead.

## Administer safely

- Keep the owner account protected and assign admins only to people who manage the installation.
- Give each sending workload a named project ingestion key so it can be rotated independently.
- Review retention per project before enabling full prompt and response capture.
- Export anything that must survive before deleting a project; deletion has no restore path.

Continue with [Authentication](/lens/workspace/authentication) to understand accounts, or [Projects](/lens/workspace/projects) to choose your data boundaries.
