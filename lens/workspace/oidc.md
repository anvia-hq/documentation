# OIDC and SSO

Lens supports one deployment-configured OpenID Connect provider alongside password login, or as the only ordinary sign-in method. Owners still bootstrap a fresh installation through its password setup form.

Configure the provider in the deployment environment; this is not a workspace UI toggle. Keep password login enabled until a real provider round trip, invitation acceptance, and account recovery have been checked.

## Register and configure the provider

Register this exact callback at the identity provider:

```text
https://lens.example.com/api/auth/callback/oidc
```

Its general form is `${PUBLIC_APP_URL}/api/auth/callback/${OIDC_PROVIDER_ID}`. Use the public HTTPS Lens origin, not the private API container URL.

An invitation-only starting configuration is:

```dotenv
OIDC_ENABLED=true
OIDC_PROVIDER_ID=oidc
OIDC_DISPLAY_NAME=Company SSO
OIDC_DISCOVERY_URL=https://id.example.com/.well-known/openid-configuration
OIDC_CLIENT_ID=lens
OIDC_CLIENT_SECRET=replace-with-provider-client-secret
OIDC_SCOPES=openid profile email
OIDC_REQUIRE_ISSUER_VALIDATION=false
OIDC_TOKEN_ENDPOINT_AUTH=auto
OIDC_REQUIRE_VERIFIED_EMAIL=false
OIDC_AUTO_PROVISION=false
OIDC_ALLOWED_DOMAINS=
PASSWORD_LOGIN_ENABLED=true
```

Protect the client secret. Reconcile the deployment after editing `.env`:

```sh
docker compose up -d
```

`OIDC_TOKEN_ENDPOINT_AUTH=auto` uses the provider's advertised authentication method, with `client_secret_basic` as the fallback when metadata is silent. Use `basic` or `post` only when the provider requires an explicit override. See [Configuration](/lens/self-hosting/configuration#oidc-and-password-login) for all defaults.

## Understand admission

| Identity | Admission |
| --- | --- |
| Existing workspace member | Can sign in through the configured provider; supported account linking avoids a duplicate account. |
| Pending, unexpired invitation | Matching email joins with its invited member/admin role. |
| No invitation, auto-provisioning enabled | A provider-verified email in an exact allowed domain joins as `member`. |
| No membership and no qualifying invitation/provisioning | Access is denied. |

Domain provisioning always requires verified email. Invitation admission normally relies on admin intent and can accept a provider that omits `email_verified`; `OIDC_REQUIRE_VERIFIED_EMAIL=true` tightens invitation/provisioning admission. Do not treat that flag as identity-provider access revocation or a universal recheck of existing memberships.

To enable domain provisioning deliberately:

```dotenv
OIDC_AUTO_PROVISION=true
OIDC_ALLOWED_DOMAINS=example.com example.org
```

Domains match the full email domain exactly, not wildcard subdomains. Space- or comma-separated lists are supported. This grants access to all projects in the workspace, so it is broader than a project invitation.

## Accept invitations and recover removed SSO users

Use the **Continue with** provider action on the invitation/sign-in screen. Password invitation claiming is unavailable when ordinary password login is disabled.

An existing account linked to the configured OIDC provider and having no workspace membership can be invited again. A successful sign-in restores membership and consumes the invitation. This exception does not enable arbitrary password invitation claiming for every existing account.

Removing membership does not block an otherwise eligible user from domain auto-provisioning again. Complete [offboarding](/lens/workspace/members-and-roles#remove-a-member) at the identity provider and revoke separately issued Lens credentials.

## Make SSO the only ordinary login

After successful verification, set `PASSWORD_LOGIN_ENABLED=false` and reconcile services. Disabling both password login and OIDC is invalid. Initial owner setup remains available on a fresh installation; the flag does not change that bootstrap path.

Keep an operator recovery plan for provider outages or incorrect discovery/client settings. Do not promise a password-reset UI flow that the current product does not provide.

Reviewed against [Lens OIDC admission](https://github.com/anvia-hq/lens/blob/b06101f36392d4b1bab5a1b69a53d29e67fc22f5/apps/api/src/modules/auth/oidc.ts), auth UI/services, and configuration at v0.20.0 on 2026-11-23. A source review is not a live test of your identity provider.
