# Authenticate an agent endpoint

**Level:** Application

## Outcome

Expose an Anvia agent through a server endpoint where product authentication and authorization run
before a prompt, tool, memory scope, or trace context is created.

## When to use it

Use this boundary for every browser, mobile, webhook, or third-party request. Anvia executes agent
work; it does not provide product accounts, sessions, JWT verification, or tenant authorization.

## Request flow

```text
request -> framework/auth provider -> product authorization -> validated body
        -> trusted tenant/user/session context -> Anvia agent -> response
```

## Setup

Install your chosen framework and authentication library alongside Anvia. The following handler uses
application interfaces so it is not coupled to a specific auth vendor.

```sh
pnpm add @anvia/core @anvia/openai zod
pnpm add --save-dev @types/node tsx typescript
```

```text
src/
  auth.ts           # application authentication/authorization port
  conversations.ts  # tenant-owned conversation repository port
  agent.ts          # Anvia agent construction
  server.ts         # validated HTTP boundary
```

## Implementation by boundary

The auth and repository tabs are intentionally ports: connect them to your existing identity provider
and database rather than treating Anvia as the owner of those systems.

::: code-group

```ts [src/auth.ts]
import type { Conversation } from "./conversations.js";

export type Principal = {
  userId: string;
  tenantId: string;
};

export type AuthService = {
  authenticate(request: Request): Promise<Principal | null>;
  authorize(
    principal: Principal,
    action: "conversation:prompt",
    conversation: Conversation,
  ): Promise<void>;
};
```

```ts [src/conversations.ts]
export type Conversation = {
  id: string;
  tenantId: string;
};

export type ConversationRepository = {
  find(id: string): Promise<Conversation | null>;
};
```

```ts [src/agent.ts]
import { Agent } from "@anvia/core/agent";
import { OpenAIClient } from "@anvia/openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");

const openai = new OpenAIClient({ apiKey });

export const supportAgent = new Agent({
  id: "support",
  model: openai.completionModel("gpt-5"),
  instructions: "Answer support questions clearly and concisely.",
});
```

```ts [src/server.ts]
import { z } from "zod";
import { supportAgent } from "./agent.js";
import type { AuthService } from "./auth.js";
import type { ConversationRepository } from "./conversations.js";

const Body = z.object({
  message: z.string().trim().min(1).max(8_000),
  conversationId: z.string().uuid(),
});

export function createPostHandler(auth: AuthService, conversations: ConversationRepository) {
  return async function POST(request: Request): Promise<Response> {
    const principal = await auth.authenticate(request);
    if (!principal) return Response.json({ error: "unauthenticated" }, { status: 401 });

    const parsed = Body.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "invalid_request" }, { status: 400 });
    }

    const conversation = await conversations.find(parsed.data.conversationId);
    if (!conversation || conversation.tenantId !== principal.tenantId) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    await auth.authorize(principal, "conversation:prompt", conversation);

    const response = await supportAgent
      .prompt(parsed.data.message)
      .withTrace({
        name: "support-request",
        userId: principal.userId,
        sessionId: conversation.id,
        metadata: { tenantId: principal.tenantId },
      })
      .send();

    return Response.json({ output: response.output });
  };
}
```

:::

Only server-derived, opaque IDs enter the Anvia trace context. If you add memory, construct its
session scope only after the same authorization check; a memory scope selects records but does not
authorize access.

## Expected behavior and failures

Unauthenticated requests return `401`; malformed input returns `400`; missing or inaccessible
conversations return the same `404`; authorized requests invoke the model. A provider failure should
map to a stable application error without exposing credentials, prompts, or raw stack traces.

## Security and production adaptations

Verify issuer, audience, signature, expiry, and revocation according to your auth provider. Add CSRF
protection for cookie sessions, rate limits after identity resolution, body-size limits before JSON
parsing, and tool-level authorization for every side effect. Do not trust browser-supplied user or
tenant IDs. Keep provider and observability keys server-only.

## Tests

Test missing, expired, and forged credentials; cross-tenant conversation IDs; revoked permissions;
invalid bodies; authorized access; and a tool attempting an unauthorized object reference. Mock the
agent for endpoint tests and separately test the real agent contract.

## Source and extensions

- Transport source: [`01_basics/07-server-react-transport.ts`](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/01_basics/07-server-react-transport.ts)
- Add [rate limits](/examples/production/rate-limits) and [persistent memory](/examples/data-and-workflows/persistent-memory).
- Review [memory sessions](/sdk/memory/sessions) and [tool control](/sdk/advanced/hooks/tool-control).
- Extend with service accounts, webhook signatures, or step-up approval for high-risk tools.
