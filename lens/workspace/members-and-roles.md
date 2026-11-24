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
| Change retention or delete telemetry/project data | Yes | Yes | No |
| View model pricing and recalculation history | Yes | Yes | Yes |
| Manage prices or recalculate historical costs | Yes | Yes | No |
| Manage MCP tokens and inspect System Health | Yes | Yes | No |
| Change or remove the owner | No | No | No |

The first account created during workspace bootstrap is the owner. Admins can perform normal workspace and project administration, but they do not replace the protected owner.

## Invite someone

Open **Members**, select **Add member**, then enter the person's email and choose `Member` or `Admin`. Lens creates a private invitation link instead of depending on email delivery.

Copy the link and share it through a trusted channel. It expires after seven days. Owners and admins can see pending invitations, copy their links again, or cancel them.

Choose `Member` for people who investigate telemetry and evaluation results. Choose `Admin` only when the person must manage the workspace or project configuration.

## Accept an invitation

The recipient opens the invitation link, creates their account, and joins with the role selected by the inviter. The invited email is fixed.

If the invitation has expired or was cancelled, create a new one. Password invitation claiming cannot attach an existing account. With [OIDC](/lens/workspace/oidc), an existing account linked to the configured provider and having no workspace membership can be invited again; signing in through that provider restores membership and consumes the invitation.

## Change a role

Use the role selector in the member table to switch a non-owner account between `Member` and `Admin`. The new role takes effect across every project.

Review the change as a workspace-wide permission grant. An admin can create and delete projects, rotate ingestion credentials, change retention, and manage other non-owner members.

The owner's role is fixed and cannot be changed.

## Remove a member

Select the remove action for a non-owner account and confirm. Subsequent membership-guarded browser and API requests fail, even if an old browser session remains.

Two protections apply:

- the owner cannot be removed;
- the current user cannot remove themselves.

Removal does not delete previously sent telemetry or revoke independently issued credentials. Complete offboarding by revoking [MCP tokens](/lens/workspace/mcp-access) the person could access and rotating exposed [project keys](/lens/workspace/project-settings/ingestion-keys). MCP authorization is tied to the token’s workspace, not its creator’s current membership. If OIDC auto-provisioning is enabled, also remove the person’s eligibility at the identity provider or change provisioning policy; a qualifying account can otherwise join again.

## Review access regularly

- Keep at least one carefully protected owner account.
- Limit admins to people who genuinely need destructive or credential-management access.
- Remove departed members rather than relying on an existing browser session to expire.
- Treat project ingestion credentials separately from user membership.

For the account lifecycle behind invitations and sessions, see [Authentication](/lens/workspace/authentication).
