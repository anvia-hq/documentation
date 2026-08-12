# Isolate multi-tenant memory

**Level:** Pattern · **Estimated time:** 40 minutes

## Outcome

Bind every conversation to an authenticated tenant and user before Anvia loads or appends memory.

## When to use it

Use this in SaaS applications where session identifiers can collide across tenants or users may
belong to several organizations.

## Request flow

session middleware → tenant membership check → application conversation lookup → opaque memory
scope → `agent.session(...)` → prompt. Tenant and user values come from trusted server state.

## Resolve an owned conversation

```ts
type Principal = { tenantId: string; userId: string };

async function promptConversation(
  principal: Principal,
  publicConversationId: string,
  question: string,
) {
  const conversation = await conversations.findOwned({
    tenantId: principal.tenantId,
    userId: principal.userId,
    publicId: publicConversationId,
  });
  if (conversation === undefined) throw new Error("Conversation not found");

  // `memoryKey` is application-generated and never accepted directly from the caller.
  return agent
    .session(conversation.memoryKey, { userId: principal.userId })
    .prompt(question)
    .send();
}
```

The repository lookup is as important as the memory adapter. Return the same not-found response
for unknown and unauthorized conversations to reduce identifier disclosure.

## Scope design

Prefer random opaque conversation IDs plus tenant/user columns and database constraints. If your
adapter scope options support tenant-aware prefixes, configure them consistently, but keep an
application authorization lookup in front of the store. Do not concatenate unvalidated header
values into table names or SQL identifiers.

## Expected behavior

The same public conversation ID in two tenants resolves to distinct durable memory scopes. A user
removed from a tenant loses access immediately even though retained messages still exist according
to policy.

## Failure cases

Tenant switching, stale session claims, membership removal, conversation transfer, duplicate IDs,
and background deletion all create race conditions. Resolve membership on every sensitive request
or use appropriately short-lived authoritative claims.

## Security and ownership

Anvia stores messages under the context you provide; it does not authenticate tenants. The
application owns membership, row policies, encryption, retention, export, deletion, and support
access. Consider database row-level security as defense in depth.

## Production changes and tests

Add composite uniqueness, foreign keys, tenant quotas, audit events, deletion jobs, and support
impersonation controls. Test cross-tenant and cross-user canaries, tenant switch, revoked members,
guessed IDs, concurrent turns, conversation deletion, and database-policy enforcement.

## Runnable reference

- [Session memory contract](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/01_basics/06-session-memory.ts)

The cookbook demonstrates Anvia session mechanics; tenant repositories and identity checks here are
suggested application architecture.

## Extensions

Add organization-wide shared conversations with explicit roles, customer-managed encryption keys,
retention tiers, and a compliance export pipeline.
