# Build a permission-aware customer-support RAG API

Build an authenticated support endpoint that indexes a small handbook, restricts retrieval by a
trusted support role, and generates source-aware answers with Anvia.

**Level:** Application · **Estimated time:** 55 minutes

## Outcome

You will have a JSON API that:

- validates and embeds application-owned handbook records at startup;
- authenticates support principals before parsing or retrieving;
- constructs metadata filters from trusted principal state;
- uses an agent `ContextIndex` for prompt-time retrieval; and
- names the source or reports that the handbook is insufficient.

The in-memory store keeps the example self-contained. It rebuilds embeddings on restart and is not
a production persistence strategy.

## When to use it

Use this pattern when answers must be grounded in an approved handbook and visibility differs by
authenticated role or tenant. For public knowledge, begin with [basic
RAG](/examples/knowledge-and-data/basic-rag). Consequential policy decisions still need a review or
escalation path.

## Prerequisites and packages

- Node.js 22 or newer and pnpm 11 or newer.
- OpenAI access to `gpt-5.5` and `text-embedding-3-small`.
- Two independently generated bearer tokens for the example roles.

```sh
mkdir anv-support-rag && cd anv-support-rag
pnpm init
pnpm pkg set type=module scripts.dev="tsx src/server.ts"
pnpm add @anvia/core @anvia/openai @hono/node-server hono zod
pnpm add -D @types/node tsx typescript
mkdir -p src knowledge
```

## Architecture and request flow

1. Startup loads and validates the application-owned handbook.
2. `embedDocuments` creates embeddings plus flat, filterable visibility metadata.
3. `InMemoryVectorStore.fromDocuments({ documents })` creates the searchable store.
4. The route authenticates the bearer token and checks `knowledge:read`.
5. A server-owned role becomes a `vectorFilter`; question text cannot modify it.
6. `dynamicContext` retrieves and formats only eligible documents for the model.
7. The route returns the generated answer or a sanitized error.

Authorization chooses the eligible corpus. Semantic ranking chooses relevant records within it. A
similarity score is never an authorization decision.

```text
anv-support-rag/
  knowledge/support-handbook.json
  src/
    types.ts
    config.ts
    auth.ts
    request.ts
    knowledge.ts
    agent.ts
    server.ts
  .env.example
```

## Configuration and owned data

Add `.env` to `.gitignore`, commit only `.env.example`, and replace the illustrative handbook with
reviewed source material and a stable visibility taxonomy.

::: code-group

```dotenv [.env.example]
OPENAI_API_KEY=replace-with-your-openai-api-key
SUPPORT_AGENT_TOKEN=replace-with-first-openssl-rand-hex-32-output
SUPPORT_MANAGER_TOKEN=replace-with-second-openssl-rand-hex-32-output
```

```json [support-handbook.json]
[
  {
    "id": "refund-window",
    "title": "Standard refund window",
    "text": "Customers may request a refund within 30 calendar days of purchase.",
    "source": "support-handbook/refunds#standard-window",
    "visibility": "agent"
  },
  {
    "id": "delivery-delay",
    "title": "Delayed delivery response",
    "text": "Escalate when a delayed delivery has no new carrier scan for 48 hours.",
    "source": "support-handbook/shipping#delays",
    "visibility": "agent"
  },
  {
    "id": "refund-exception",
    "title": "Refund exception review",
    "text": "An exception requires manager review and a recorded reason and customer impact.",
    "source": "support-handbook/refunds#manager-exceptions",
    "visibility": "manager"
  }
]
```

:::

## Types, configuration, and authentication

The Zod schema protects the ingestion boundary. Authentication returns an application principal;
request data never supplies its role, permission, or visibility.

::: code-group

```ts [types.ts]
import { z } from "zod";

export const knowledgeDocumentSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  text: z.string().min(1).max(20_000),
  source: z.string().min(1).max(500),
  visibility: z.enum(["agent", "manager"]),
}).strict();

export type KnowledgeDocument = z.infer<typeof knowledgeDocumentSchema>;
export type Principal = {
  id: string;
  role: "agent" | "manager";
  permissions: ReadonlySet<"knowledge:read">;
};
```

```ts [config.ts]
import { z } from "zod";

export const env = z.object({
  OPENAI_API_KEY: z.string().min(16),
  SUPPORT_AGENT_TOKEN: z.string().min(32),
  SUPPORT_MANAGER_TOKEN: z.string().min(32),
}).parse(process.env);
```

```ts [auth.ts]
import { timingSafeEqual } from "node:crypto";
import { env } from "./config.js";
import type { Principal } from "./types.js";

export function authenticate(header: string | undefined): Principal | undefined {
  if (header === undefined || !header.startsWith("Bearer ")) return undefined;
  const token = header.slice("Bearer ".length);
  if (secretMatches(token, env.SUPPORT_MANAGER_TOKEN)) {
    return principal("support-manager", "manager");
  }
  if (secretMatches(token, env.SUPPORT_AGENT_TOKEN)) {
    return principal("support-agent", "agent");
  }
  return undefined;
}

function principal(id: string, role: Principal["role"]): Principal {
  return { id, role, permissions: new Set(["knowledge:read"]) };
}

function secretMatches(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length
    && timingSafeEqual(actualBytes, expectedBytes);
}
```

```ts [request.ts]
import type { HonoRequest } from "hono";
import { z } from "zod";

const schema = z.object({ question: z.string().trim().min(1).max(2_000) }).strict();

export class AnswerRequestError extends Error {
  constructor(readonly status: 400 | 413, message: string) { super(message); }
}

export async function parseAnswerRequest(request: HonoRequest): Promise<string> {
  const declared = Number(request.header("content-length") ?? "0");
  if (!Number.isFinite(declared) || declared > 8_000) {
    throw new AnswerRequestError(413, "Request body is too large");
  }
  let input: unknown;
  try { input = await request.json(); }
  catch { throw new AnswerRequestError(400, "Invalid JSON"); }
  if (new TextEncoder().encode(JSON.stringify(input)).byteLength > 8_000) {
    throw new AnswerRequestError(413, "Request body is too large");
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new AnswerRequestError(400, "Invalid request");
  return parsed.data.question;
}
```

:::

## Ingestion, retrieval, and agent

`embedDocuments` retains each complete `KnowledgeDocument` in search results while embedding its
title and text. Metadata remains flat and filterable. `createSupportAgent` is request-scoped because
its filter is principal-specific; the shared models and index are created once.

::: code-group

```ts [knowledge.ts]
import { readFile } from "node:fs/promises";
import { embedDocuments } from "@anvia/core/embeddings";
import { InMemoryVectorStore } from "@anvia/core/vector-store";
import { OpenAIClient } from "@anvia/openai";
import { env } from "./config.js";
import { knowledgeDocumentSchema, type KnowledgeDocument } from "./types.js";
import { z } from "zod";
const raw = JSON.parse(await readFile(new URL("../knowledge/support-handbook.json", import.meta.url), "utf8"));
export const documents = z.array(knowledgeDocumentSchema).min(1).parse(raw);
const openai = new OpenAIClient({ apiKey: env.OPENAI_API_KEY });
export const embeddingModel = openai.embeddingModel({
    modelId: "text-embedding-3-small"
});
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: documents,
    id: (document) => document.id,
    content: (document) => `${document.title}\n${document.text}`,
    metadata: (document) => ({
        source: document.source,
        visibility: document.visibility,
    })
});
export const completionModel = openai.completionModel({
    modelId: "gpt-5.5",
    api: "responses"
});
export const knowledgeStore = InMemoryVectorStore.fromDocuments<KnowledgeDocument>({
    documents: embedded
});
```

```ts [agent.ts]
import { Agent, createVectorContext } from "@anvia/core/agent";
import { vectorFilter } from "@anvia/core/vector-store";
import { completionModel, embeddingModel, knowledgeStore } from "./knowledge.js";
import type { Principal } from "./types.js";
export function createSupportAgent(principal: Principal) {
    const filter = principal.role === "manager"
        ? vectorFilter.or(vectorFilter.eq("visibility", "agent"), vectorFilter.eq("visibility", "manager"))
        : vectorFilter.eq("visibility", "agent");
    return new Agent({
        id: "customer-support-rag",
        model: completionModel,
        instructions: [
            "Answer only from the retrieved handbook documents.",
            "If they are insufficient, say so; never invent policy or approval.",
            "End handbook claims with the supplied Source value in parentheses.",
        ].join("\n"),
        context: [createVectorContext({
                store: knowledgeStore,
                model: embeddingModel,
                topK: 4, filter, format: (result) => ({
                    id: result.id,
                    text: `Title: ${result.document.title}\nSource: ${result.document.source}`
                        + `\n\n${result.document.text}`,
                })
            })],
    });
}
```

```ts [server.ts]
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createSupportAgent } from "./agent.js";
import { authenticate } from "./auth.js";
import { documents } from "./knowledge.js";
import { AnswerRequestError, parseAnswerRequest } from "./request.js";

const app = new Hono();
app.get("/health", (context) => context.json({ ok: true, documents: documents.length }));

app.post("/answer", async (context) => {
  const principal = authenticate(context.req.header("authorization"));
  if (principal === undefined) return context.json({ error: "Unauthorized" }, 401);
  if (!principal.permissions.has("knowledge:read")) {
    return context.json({ error: "Forbidden" }, 403);
  }

  try {
    const question = await parseAnswerRequest(context.req);
    const response = await createSupportAgent(principal).generate({
        prompt: question
    });
    if (response.status !== "completed") {
      return context.json({ error: "Unexpected approval request" }, 409);
    }
    return context.json({ answer: response.output });
  } catch (error) {
    if (error instanceof AnswerRequestError) {
      return context.json({ error: error.message }, error.status);
    }
    return context.json({ error: "Answer generation failed" }, 502);
  }
});

serve({ fetch: app.fetch, hostname: "127.0.0.1", port: 8787 });
```

:::

## Setup and run

Copy `.env.example` to `.env`, fill it, and load the values before starting the API:

```sh
set -a
. ./.env
set +a
pnpm dev
```

In a second terminal, load `.env` and compare the roles:

```sh
curl --fail-with-body http://127.0.0.1:8787/answer \
  -H "authorization: Bearer $SUPPORT_AGENT_TOKEN" \
  -H 'content-type: application/json' \
  --data '{"question":"Can I issue a refund after 30 days?"}'

curl --fail-with-body http://127.0.0.1:8787/answer \
  -H "authorization: Bearer $SUPPORT_MANAGER_TOKEN" \
  -H 'content-type: application/json' \
  --data '{"question":"What is required to review a refund after 30 days?"}'
```

## Expected behavior

- The agent token retrieves only `agent` records and cannot see the exception procedure.
- The manager token can retrieve both visibility classes and should cite the exception source.
- An invalid token returns `401` before parsing, vector search, or completion.
- Invalid JSON, extra fields, empty questions, and oversized bodies fail closed.
- Unsupported questions receive an insufficient-handbook answer rather than invented policy.

Exact prose and ranking vary by model. Treat these behaviors as evaluation assertions rather than
guaranteed wording.

## Failure cases, security, and ownership

- Never accept a role, tenant, visibility, or filter expression from request data or the model.
- Treat indexed text as untrusted content; prompt injection cannot authorize tools.
- Validate provenance, approval, freshness, deletion, and visibility before ingestion.
- Prefer namespaces, database policy, or separate indexes in addition to filters for strong tenant
  or regulatory isolation.
- Add edge body limits, rate limits, timeouts, request IDs, audit events, and cost controls.
- Avoid logging tokens, full questions, retrieved private documents, or raw provider payloads.
- A source-aware answer is not proof of grounding; evaluate citation accuracy and refusal behavior.

The application owns identity, authorization, corpus lifecycle, and answer policy. Anvia performs
embedding, filtered retrieval, and agent orchestration using the context supplied by the app.

## Production changes and tests

Move ingestion to a durable versioned job and use an adapter such as pgvector, Qdrant, Chroma, or
LanceDB. Add a forbidden-document canary that is the nearest semantic match and assert it is never
eligible for the agent role. Test every role pair, missing metadata, invalid credentials, empty
retrieval, prompt injection, provider failure, deletion, and citation membership. Use fake models
to inspect the exact context without network calls.

## Runnable references and extensions

- [Embed and search](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/06_retrieval/01-embed-and-search.ts)
- [Filters and LSH](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/06_retrieval/02-filters-and-lsh.ts)
- [RAG search tool](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/06_retrieval/05-rag-search-tool.ts)

Those files demonstrate the current primitives independently. This page provides a coherent
application layout but intentionally omits deployment identity middleware, a durable ingestion
worker, and a persistent vector backend. Add tenant scope, retrieval evaluations, and approved
source-version migrations next.
