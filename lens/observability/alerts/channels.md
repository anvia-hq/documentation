# Notification channels

Lens sends incident-opening notifications to Slack, Discord, Telegram, or a generic webhook. Create channels in the project, test them, then select them in a rule's **Send to** field.

Owners and admins manage channels and test delivery. Other workspace members can inspect incident delivery history. Channel configuration is project-scoped; this does not create separate human-access groups inside a workspace.

## Create and test a channel

1. Open **Alerts → Channels** and select **New channel**.
2. Choose its type and a recognizable name.
3. Supply the destination's required fields.
4. Save the channel and use **Send test**.
5. Open **Rules**, create/edit a rule, and select the channel under **Send to**.

| Type | Required configuration |
| --- | --- |
| Slack | Incoming webhook URL on the supported official HTTPS host. |
| Discord | Official HTTPS webhook URL. |
| Telegram | Bot token and chat ID or channel username. |
| Webhook | HTTP(S) URL; optional 16–256-character signing secret. |

Creating a channel without selecting it in a rule does not subscribe it to every incident. Store provider credentials privately. Using the required deployment `LENS_ALERT_SECRET_KEY`, Lens encrypts Slack/Discord webhook URLs, Telegram bot tokens, and generic-webhook signing secrets at rest. Telegram chat IDs and generic webhook URLs remain plaintext routing fields: do not embed credentials or secrets in a generic URL's path/query. List responses omit configuration entirely. See [encryption rotation](/lens/self-hosting/upgrades-and-backups#rotate-alert-channel-encryption).

## Understand delivery

Delivery is scheduled when a **new incident opens**, with a project/rule summary and a link to investigate in Lens. It is not a notification on every later breach, acknowledgement, or resolution.

Open the incident's **Deliveries** card:

| Status | Meaning |
| --- | --- |
| `pending` | Queued or awaiting a retry; inspect attempts/errors for progress. |
| `delivered` | The destination accepted the request. |
| `failed` | A terminal rejection, missing channel, or exhausted retry budget. |

Workers retry retryable failures with bounded backoff; non-retryable failures end immediately. A successful send does not prove a person received or acted on it. Native email and PagerDuty channels are not included; escalation remains owned by your operational system.

Deleting a channel preserves historical delivery records but can cause queued work to fail when the target is no longer available. Review active rules before deleting or replacing a destination.

## Generic webhooks

Incident notifications contain `event: "alert.opened"`, `projectId`, `incident`, and `message`. **Send test** instead sends `event: "alert.test"`, `projectId`, and `message`, without an `incident`. Receivers should handle both envelopes. Headers include `x-lens-topic` (the event) and `x-lens-timestamp`.

When a secret is configured, `x-lens-signature` has the form `t=<timestamp>,v1=<hex-digest>`. The digest is HMAC-SHA256 over `<timestamp>.<exact raw request body>`. The receiver owns verification, timestamp/replay policy, and idempotent handling; do not reconstruct the body from parsed JSON before verifying its signature.

Use HTTPS for production destinations. Targets must resolve to public addresses: loopback, private/link-local destinations, embedded URL credentials, and redirects are rejected. This means a webhook pointing at an internal Compose service is not a supported delivery target. Permit destination and DNS egress from both the **API** (synchronous Send test) and the **worker** (queued incident dispatch). A working worker route does not prove the API can send its test.

## Diagnose missing notifications

- Confirm the channel is selected in the rule and a new incident actually opened.
- Send a test to distinguish destination/configuration errors from incident processing; tests run in the API, not the worker queue.
- Check incident delivery attempts and errors, worker/Redis availability, and [System Health](/lens/self-hosting/system-health).
- Repair the cause before considering targeted retained-job replay; avoid blind bulk retries that can duplicate external notifications.

Reviewed against [Lens channel contracts](https://github.com/anvia-hq/lens/blob/b06101f36392d4b1bab5a1b69a53d29e67fc22f5/packages/contracts/src/alerts.ts), dispatch worker, and HTTP transport at v0.20.0 on 2026-11-23.
