# Persistent agent memory with SQLite

**Level:** Pattern

## Outcome

Build a command-line agent that stores conversation history in a SQLite file. Run it once to
save a fact, then start a new process with the same session scope and ask the agent to recall the
fact.

**Difficulty:** Beginner

**Estimated time:** 25 minutes

## Prerequisites

- Node.js 22.13 or newer, with the built-in `node:sqlite` `DatabaseSync` API
- pnpm 11 or newer
- An OpenAI API key
- A model available to your OpenAI account

## Packages

- `@anvia/core` provides `Agent` and session handling.
- `@anvia/openai` provides the OpenAI completion model adapter.
- `@anvia/memory-sqlite` provides the supported durable `MemoryStore` used here.
- `tsx`, `typescript`, and `@types/node` run and type-check the example locally.

## Architecture and flow

```text
authenticated application user
        |
        | supplies stable sessionId, userId, and tenantId
        v
agent.generate({ prompt, session }) -> Agent -> OpenAI completion model
        |
        | load before each prompt; append after each completed turn
        v
data/anvia-memory.sqlite
```

The first process writes a turn to SQLite. The second process constructs the same scope key from
the same stable identifiers, loads the earlier messages, and includes them in the new model call.

## Project structure

```text
src/
  memory.ts  # durable store and scope dimensions
  agent.ts   # provider and agent construction
  cli.ts     # stable product identity and commands
data/
```

## Implementation

::: code-group

```ts [src/memory.ts]
import { SqliteMemoryClient } from "@anvia/memory-sqlite";

export const scope = {
  sessionId: "project-chat-123",
  userId: "user-456",
  tenantId: "tenant-789",
};

export const memoryClient = new SqliteMemoryClient({
  path: "data/anvia-memory.sqlite",
});

export const memory = memoryClient.memoryStore({
  scopeKey: {
    includeUserId: true,
    metadataKeys: ["tenantId"],
  },
});
```

```ts [src/agent.ts]
import { Agent } from "@anvia/core/agent";
import { OpenAIClient } from "@anvia/openai";
import { memory } from "./memory.js";

export function createProjectAgent() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set OPENAI_API_KEY before running this example.");

  const openai = new OpenAIClient({ apiKey });
  return new Agent({
    id: "project-assistant",
    model: openai.completionModel({
        modelId: "gpt-5.6-sol",
        api: "responses"
    }),
    instructions: "Answer concisely. Use stored conversation facts when relevant.",
    memory: { store: memory, savePolicy: "turn" },
  });
}
```

```ts [src/cli.ts]
import { mkdir } from "node:fs/promises";
import { createProjectAgent } from "./agent.js";
import { memory, scope } from "./memory.js";

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command !== "write" && command !== "recall") {
    throw new Error("Usage: pnpm tsx src/cli.ts <write|recall>");
  }

  await mkdir("data", { recursive: true });
  await memory.ensure();
  const agent = createProjectAgent();
  const session = {
    sessionId: scope.sessionId,
    userId: scope.userId,
    metadata: { tenantId: scope.tenantId },
  };

  const prompt = command === "write"
    ? "Remember that the launch codename is Firefly."
    : "What is the launch codename?";
  const response = await agent.generate({
    prompt,
    session,
  });
  if (response.status !== "completed") {
    throw new Error(`Unexpected agent result: ${response.status}`);
  }
  console.log(response.output);
  if (command === "write") console.log("The completed turn is stored in SQLite.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
```

:::

## Set up and run

Create an empty directory, install the packages, and create the file tree above:

```sh
mkdir anvia-persistent-memory
cd anvia-persistent-memory
pnpm init
pnpm pkg set type=module
pnpm add @anvia/core @anvia/openai @anvia/memory-sqlite
pnpm add --save-dev tsx typescript @types/node
export OPENAI_API_KEY="your-api-key"
```

Run the write phase:

```sh
pnpm tsx src/cli.ts write
```

After that process exits, run the recall phase:

```sh
pnpm tsx src/cli.ts recall
```

## Expected behavior

The write command creates `data/anvia-memory.sqlite`, sends the first prompt, and persists the
completed turn. The recall command runs in a new process, loads that history from the same SQLite
file and scope, and asks the model about the codename. The response wording is model-dependent,
but it should identify `Firefly`.

Changing `sessionId`, `userId`, or `tenantId` selects a different stored history. Repeating the
write command with the same scope appends another turn rather than replacing the conversation.

## How it works

`SqliteMemoryClient` owns the SQLite connection and `memoryStore()` creates the official Anvia
memory adapter. Supplying a file path makes the store survive process restarts; use `':memory:'`
for an in-memory database. This example calls `ensure()` before the first run.

`memory: { store: memory, savePolicy: "turn" }` attaches the store and saves complete model-and-tool
turns together. The `session` property carries the memory scope for every prompt in that
conversation. Before a prompt runs, Anvia calls the store's public `load(...)` contract; after a
completed turn, it appends the new messages according to the save policy.

The SQLite scope includes `sessionId` and `userId` by default. This example also selects
`metadata.tenantId`, making the lookup key stable across restarts and distinct across tenants.

## Production and security notes

- **Scope is not authorization.** A matching session scope only selects stored rows. Before
  passing a session scope to the agent, verify that the authenticated caller may access that tenant,
  user, and conversation. Never trust IDs supplied by a browser without this check.
- Generate stable, opaque conversation IDs in your product database. Do not use a request ID or
  create a new session ID for every turn.
- Store the SQLite file on durable storage, back it up with an SQLite-aware process, and define
  retention and deletion behavior for conversation data.
- SQLite is appropriate for a local or single-process deployment. Use a shared adapter such as
  Postgres when independently scaled workers must access the same conversations.
- Keep `validateMessages` enabled at untrusted persistence boundaries, protect the API key, and
  avoid writing secrets or unnecessary personal data into prompts or metadata.
- Concurrent prompts against the same conversation can produce surprising conversational order
  even though the adapter serializes database appends. Serialize same-session product requests
  when ordering matters.

## Next steps

- Review [memory sessions](/sdk/memory/sessions) and [save policies](/sdk/memory/save-policies).
- Add tenant-specific scope rules with [SQLite memory configuration](/packages/memory-sqlite/configuration).
- Move multi-worker deployments to a [supported store adapter](/sdk/memory/store-adapters).
- Add [memory compaction](/sdk/memory/compaction) for long-running conversations.

## Tests and source

Run the write and recall phases in separate processes against a temporary database. Also test that
changing each scope dimension prevents recall, invalid persisted messages are rejected, and two
concurrent prompts follow your application's ordering policy. Delete the temporary database after
the suite.

- Cookbook foundation: [`01_basics/06-session-memory.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/01_basics/06-session-memory.ts)
- Adapter tests: [`packages/memory-sqlite/test`](https://github.com/anvia-hq/anvia/tree/v1-rc3/packages/memory-sqlite/test)
