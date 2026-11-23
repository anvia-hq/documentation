# Authentication

Lens supports password accounts and a deployment-configured OpenID Connect provider. The first account bootstraps the workspace as its owner using the password setup form. Later users join through invitations or optional verified-email domain provisioning. See [OIDC and SSO](/lens/workspace/oidc) for setup and admission rules.

## Create the workspace owner

Open an uninitialized Lens installation. The root page displays **Workspace setup** instead of the sign-in form.

Enter your name, email address, password, and matching password confirmation. Passwords must contain at least eight characters. Lens then creates:

- the first account;
- the workspace organization;
- an `owner` membership;
- an authenticated browser session.

Bootstrap is rate-limited and closes as soon as the first account exists. Refreshing or opening the installation later shows the normal sign-in page. The owner cannot be demoted or removed in the current product.

## Sign in and out

Open the Lens origin and use **Sign in** with password credentials or **Continue with** the configured SSO provider. SSO-only deployments hide ordinary password login; initial owner setup remains available on a fresh installation. Use the sign-out action beside your account at the bottom of either workspace or project navigation when finished.

A browser session grants access only while its user still has workspace membership. Removing a member makes authenticated workspace and project requests fail even if an older session cookie remains in their browser.

## Join through an invitation

An owner or admin creates an invitation from **Members** and shares the generated link privately. The recipient opens the exact link and supplies a name, password, and confirmation, or accepts through the configured SSO provider. Password claiming is unavailable when password login is disabled.

The email address and role come from the invitation and cannot be changed while accepting it. Invitations:

- expire after seven days;
- work only while their status is `pending`;
- cannot be reused after acceptance or cancellation;
- cannot create a second password account for an email that already exists.

OIDC has an account-linking and re-invitation path for eligible existing users; see [Members and roles](/lens/workspace/members-and-roles#accept-an-invitation).

An expired, cancelled, accepted, or unknown invitation appears as unavailable. Ask an owner or admin to cancel the old invitation if necessary and create a new one.

## Plan account recovery

Lens can deliver password-reset email when SMTP is configured, but the current sign-in screen does not expose a self-service reset action. Operators should establish an account-recovery procedure before inviting users and should not promise a UI workflow that is not currently available.

Protect the owner account especially carefully: ownership cannot be transferred through the current interface.

## Secure authentication in production

- Serve Lens over HTTPS.
- Set `PUBLIC_APP_URL` and `WEB_ORIGIN` to the same public origin.
- Generate a unique `BETTER_AUTH_SECRET` of at least 32 characters and keep it outside source control.
- Share invitation links through a trusted channel; anyone holding a pending link can claim its account.
- Remove departed members promptly from [Members and roles](/lens/workspace/members-and-roles).

Authentication controls access to the Lens application. Ingestion uses separate project credentials described in [Ingestion keys](/lens/workspace/project-settings/ingestion-keys).
