# Members and roles

Workspace membership controls who can sign in and which management actions they can perform. A membership applies to every project in the Lens installation; Lens does not currently assign people to individual projects.

## Compare the roles

| Capability | Owner | Admin | Member |
| --- | --- | --- | --- |
| View workspace projects and telemetry | Yes | Yes | Yes |
| View the member directory | Yes | Yes | Yes |
| Create projects | Yes | Yes | No |
| Invite members | Yes | Yes | No |
| Change a non-owner role | Yes | Yes | No |
| Remove another non-owner member | Yes | Yes | No |
| Manage project ingestion keys | Yes | Yes | No |
| Change retention or delete a project | Yes | Yes | No |
| Change or remove the owner | No | No | No |

The first account created during workspace bootstrap is the owner. Admins can perform normal workspace and project administration, but they do not replace the protected owner.

## Invite someone

Open **Members**, select **Add member**, then enter the person's email and choose `Member` or `Admin`. Lens creates a private invitation link instead of depending on email delivery.

Copy the link and share it through a trusted channel. It expires after seven days. Owners and admins can see pending invitations, copy their links again, or cancel them.

Choose `Member` for people who investigate telemetry and evaluation results. Choose `Admin` only when the person must manage the workspace or project configuration.

## Accept an invitation

The recipient opens the invitation link, creates their account, and joins with the role selected by the inviter. The invited email is fixed.

If the invitation has expired or was cancelled, create a new one. Invitations cannot attach a new membership to an email that already has a Lens account in the current onboarding flow.

## Change a role

Use the role selector in the member table to switch a non-owner account between `Member` and `Admin`. The new role takes effect across every project.

Review the change as a workspace-wide permission grant. An admin can create and delete projects, rotate ingestion credentials, change retention, and manage other non-owner members.

The owner's role is fixed and cannot be changed.

## Remove a member

Select the remove action for a non-owner account and confirm. The person immediately loses access to the workspace and all of its projects.

Two protections apply:

- the owner cannot be removed;
- the current user cannot remove themselves.

Removal does not delete telemetry that the person's applications previously sent. If that person also had access to deployed ingestion secrets, rotate the affected keys separately; see [Ingestion keys](/lens/workspace/project-settings/ingestion-keys).

## Review access regularly

- Keep at least one carefully protected owner account.
- Limit admins to people who genuinely need destructive or credential-management access.
- Remove departed members rather than relying on an existing browser session to expire.
- Treat project ingestion credentials separately from user membership.

For the account lifecycle behind invitations and sessions, see [Authentication](/lens/workspace/authentication).
