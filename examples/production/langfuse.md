# Trace agents with Langfuse

**Level:** Application

## Outcome

Trace an Anvia agent in Langfuse, attach stable product context, flush short-lived work, and publish
evaluation scores against the originating trace.

## When to use it

Use `@anvia/langfuse` when Langfuse is your tracing, prompt, dataset, or scoring platform. The adapter
is server-side; never include Langfuse secret keys in a browser bundle.

## Flow

```text
Anvia observer -> @anvia/langfuse -> Langfuse trace/generation/tool observations
Anvia eval reporter ----------------> trace-correlated score
```

## Setup

```sh
pnpm add @anvia/core @anvia/openai @anvia/langfuse
```

Set `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL`, and optionally environment,
release, and service-name variables in server secrets.

## Process and request boundaries

```ts
import { Agent } from "@anvia/core/agent";
import { LangfuseClient } from "@anvia/langfuse";
import { OpenAIClient } from "@anvia/openai";

const langfuse = new LangfuseClient({
  serviceName: "support-api",
});
const tracing = langfuse.observer({ captureMode: "safe" });

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! });
const agent = new Agent({
  id: "support",
  model: openai.completionModel({
      modelId: "gpt-5.6-sol",
      api: "responses"
  }),
  instructions: "Answer with verified support policy only.",
  observability: { observers: { tracing } },
});

try {
  const response = await agent.generate({
      prompt: "Who may change billing settings?",
      trace: {
          name: "support-answer",
          userId: "usr_opaque_42",
          sessionId: "conv_opaque_91",
          tags: ["support"],
          metadata: { channel: "web" },
      }
  });

  await langfuse.flush(); // useful for a short-lived command or job
  if (response.status === "completed") {
    console.log(response.output, response.trace?.traceId);
  }
} finally {
  await langfuse.close();
}
```

For a long-running server, create one adapter per process and flush through normal batching. Shut it
down once during graceful process termination, not after every request.

## Expected behavior and failures

Langfuse receives a root run plus model and tool observations. `generate()` completing does not guarantee
that buffered telemetry is already delivered. Configuration may be valid while the network or keys
fail only during export, flush, or shutdown.

## Privacy, security, and production adaptations

Safe capture still exports identifiers, tags, metadata, usage, timing, and exception information.
Use opaque IDs; never put access tokens or raw customer content in metadata. Approve retention,
access, deletion, and payload capture before using full mode. Size the score queue and retry policy,
monitor failed exports, and keep telemetry failure separate from agent availability unless the job
requires confirmed delivery.

## Tests

Mock the adapter for agent unit tests. In adapter integration tests, assert trace context, tool
observation mapping, safe capture, score publishing, failed export handling, and final queue drain.
Use synthetic content in a staging smoke trace.

## Source and extensions

- Source: [`10_integrations/03-langfuse-tracing.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/10_integrations/03-langfuse-tracing.ts)
- Explore the [`@anvia/langfuse` package guide](/packages/langfuse/get-started).
- Extend with [evaluations](/examples/production/evaluations), prompt versions, datasets, and redaction transforms.
