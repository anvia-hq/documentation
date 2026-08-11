# Projects

A project is an isolated destination for one application's telemetry and evaluation work. It owns its traces, evaluations, datasets, alerts, ingestion keys, and retention policy.

Projects do not have independent memberships. Every workspace member can open every project, while workspace role determines which management actions they may perform.

## Create the first project

After owner bootstrap, Lens asks for the first project name. Enter a recognizable application or system name, such as `Support agents`, then continue to its overview.

This first-project step appears whenever an authenticated workspace has no projects.

## Create another project

Select the Lens mark in the project rail to return to **Projects**, then select **Create project**. This action requires the `owner` or `admin` role.

Provide:

- **Name** — the human-readable label shown throughout Lens;
- **Slug** — a lowercase identifier containing letters, numbers, and single hyphens.

Lens suggests a slug from the name. The slug must be unique within the workspace. Project pages use the generated project ID in their URL, so changing an input slug while creating the project does not define a public telemetry endpoint.

## Pick useful boundaries

Use separate projects when you need one or more of these boundaries:

- independent ingestion credentials and rotation;
- different telemetry retention periods;
- separate traces, evaluations, datasets, gates, or alerts;
- a clean operational view for a distinct product or tenant;
- separation between data classifications.

Use one project with explicit telemetry context when the data should be investigated together. For example, distinguish deployment stages with `environment` and deployed builds with `release` rather than creating a project for every release.

Because membership is workspace-wide, a project does not hide its data from other workspace members.

## Switch between projects

The narrow rail beside the project sidebar lists every project in the workspace. Select a project avatar to open its overview. The highlighted project determines the telemetry, evaluations, keys, and retention used by subsequent pages.

Before creating a key or changing retention, confirm the project name in the header. Settings actions apply immediately to the active project, not to the whole workspace.

## Connect an application

Open **Connect** inside the target project for SDK configuration. Each application needs an active key pair belonging to that project.

Create separate named keys when workloads need independent deployment or revocation. Multiple workloads may send to the same project, but one project's credentials cannot send telemetry into another project.

Continue with [Ingestion keys](/lens/workspace/project-settings/ingestion-keys) for the complete connection and rotation workflow.

## Delete a project

Deletion is available from **Project settings** to owners and admins. It immediately revokes ingestion and queues permanent cleanup of telemetry and project-owned configuration.

There is no archive or restore workflow. Read [Retention and deletion](/lens/workspace/project-settings/retention-and-deletion) before removing a project.
