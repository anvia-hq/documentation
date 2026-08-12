# Trace an Anvia agent with Lens

**Level:** Application

## Outcome

Build a server-side TypeScript smoke test that attaches the native `@anvia/lens` observer to an
Anvia agent, makes one model request, flushes its trace to Lens, prints the model response and trace
ID, and shuts the observer down before exiting. The example keeps prompt and response bodies out of
telemetry and handles the adapter's buffered-export lifecycle.

**Difficulty:** Intermediate

**Estimated time:** 20 minutes with Lens and an ingestion key already configured. Allow another
45–90 minutes if you must deploy Lens first.

## Prerequisites

- Node.js 24 or newer. This is required by the current `@anvia/lens` package.
- pnpm 11 or newer.
- A reachable [Lens deployment and project](/lens/install-and-setup).
- A public and secret ingestion key copied from that project's **Connect** page.
- An OpenAI API key for the model used in this example.
- Outbound HTTPS access from the agent process to both OpenAI and your Lens origin.

Keep the Lens secret key and the model-provider key in a server-side secret manager. Do not run
this integration in browser code.

## Packages

Install the Anvia runtime, the native Lens observer, and one model provider adapter:

```sh
mkdir anvia-lens-smoke-test
cd anvia-lens-smoke-test
pnpm init
pnpm pkg set type=module
pnpm add @anvia/core @anvia/lens @anvia/openai
pnpm add --save-dev @types/node tsx typescript
```

`@anvia/lens` owns its OpenTelemetry dependencies internally. Do not add or configure a global
OpenTelemetry SDK just to use this integration.

## Data flow

```text
Application request
  -> Anvia agent
    -> OpenAI completion model
    -> @anvia/lens observer
      -> authenticated, buffered OTLP export
        -> Lens project
          -> trace, generation, status, timing, and usage
```

The observer instruments Anvia activity only. It does not replace the application's global
OpenTelemetry provider or automatically trace unrelated application work.

## Project structure

```text
src/
  observability.ts  # process-scoped Lens lifecycle
  agent.ts          # model and observed agent
  smoke.ts          # one traced request
.env
```

## Implementation

Use the browser-facing Lens origin without adding `/api` or an OTLP path; the adapter constructs its
supported ingestion paths.

::: code-group

```dotenv [.env]
OPENAI_API_KEY=replace-with-your-openai-key

ANVIA_LENS_BASE_URL=https://lens.example.com
ANVIA_LENS_PUBLIC_KEY=pk-lens-replace-me
ANVIA_LENS_SECRET_KEY=sk-lens-replace-me
ANVIA_LENS_SERVICE_NAME=support-api
ANVIA_LENS_ENVIRONMENT=development
ANVIA_LENS_RELEASE=local-smoke-test
```

```ts [src/observability.ts]
import { lens } from "@anvia/lens";

// Create one observer for the process and reuse it across agents and requests.
export const tracing = lens.createFromEnv({
  captureMode: "safe",
  timeoutMs: 10_000,
});
```

```ts [src/agent.ts]
import { AgentBuilder } from "@anvia/core/agent";
import { OpenAIClient } from "@anvia/openai";
import { tracing } from "./observability.js";

const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");

const openai = new OpenAIClient({ apiKey });

export const supportAgent = new AgentBuilder(
  "support-summary",
  openai.completionModel("gpt-5"),
)
  .name("Support summary agent")
  .instructions("Answer clearly and concisely. Do not include secrets in the response.")
  .defaultMaxTurns(4)
  .observe(tracing)
  .build();
```

```ts [src/smoke.ts]
import { supportAgent } from "./agent.js";
import { tracing } from "./observability.js";

try {
  const response = await supportAgent
    .prompt("In two sentences, explain why production agents need tracing.")
    .withTrace({
      name: "support-observability-smoke-test",
      userId: "user_demo_42",
      sessionId: "session_demo_2026_08",
      tags: ["support", "smoke-test"],
      version: "prompt-v1",
      metadata: { channel: "operations", purpose: "lens-connection-check" },
    })
    .send();

  // The run can finish before asynchronous batch export.
  await tracing.flush();
  console.log(response.output);
  console.log(`Lens trace ID: ${response.trace?.traceId ?? "unavailable"}`);
} finally {
  // Final delivery plus release of this observer's providers.
  await tracing.shutdown();
}
```

:::

All three connection values—base URL, public key, and secret key—must identify the same Lens
project. `ANVIA_LENS_SERVICE_NAME` is also required. In production, set
`ANVIA_LENS_ENVIRONMENT=production` and use an immutable build number or Git SHA for
`ANVIA_LENS_RELEASE`.

The identifiers in this smoke test are synthetic. In an application, use stable opaque product
identifiers that operators can correlate with authorized application records; do not substitute
email addresses, names, access tokens, or customer text. Add `.env` to your ignore rules and never
commit it.

## Type-check and run

Type-check the project files with settings compatible with Anvia's published ESM packages:

```sh
pnpm exec tsc \
  --noEmit \
  --target ES2022 \
  --module ESNext \
  --moduleResolution Bundler \
  --strict \
  --skipLibCheck \
  --types node \
  src/*.ts
```

Run it with Node loading `.env` and `tsx`:

```sh
node --env-file=.env --import=tsx src/smoke.ts
```

## Expected behavior

The command makes one model request, flushes pending telemetry, prints a short response and a
32-character hexadecimal trace ID when tracing starts successfully, then exits. In the matching
Lens project, open **Traces**, choose a time range containing the request, and open
`support-observability-smoke-test` or the printed trace ID.

The trace should contain the agent run and its model generation, including status, duration,
provider/model details, and available token usage. Prompt and response panels remain empty because
the example explicitly uses safe capture. Anvia's response does not wait for normal batch delivery;
the explicit `flush()` is what makes this short-lived check deterministic.

If no trace arrives, verify that the Lens origin is reachable from the application host, the two
keys are active and belong to the selected project, the base URL contains no extra path, and the
process reaches `await tracing.flush()` without an exporter timeout.

## How it works

- `lens.createFromEnv()` validates the Lens configuration and creates isolated trace and log
  providers. It does not make a startup request to verify the URL or credentials; connectivity and
  authentication errors surface when telemetry is exported or flushed. Unlike
  `createFromEnv({ optional: true })`, this production-oriented setup fails fast when Lens
  configuration is absent or partial.
- `.observe(tracing)` registers the Lens observer before the agent is built, allowing it to record
  the run, each generation, tool calls when present, usage, and failures.
- `.withTrace()` supplies searchable operational context for this request. The service,
  environment, and release describe the process; the name, user, session, tags, version, and
  metadata describe one run.
- `captureMode: 'safe'` omits traced input and output bodies. It does not hide tags, metadata,
  identifiers, exception messages, or any other values the application explicitly exports.
- `flush()` exports buffered data while leaving the observer usable. `shutdown()` performs final
  delivery, releases its providers, and is idempotent; do not start new observed work afterward.

For a long-running server, create the observer once at application startup and do not flush after
every request. During graceful termination, first stop accepting work and wait for active requests,
then await `tracing.shutdown()` within the platform's termination grace period. Set `timeoutMs` so
that exporter shutdown can finish inside that period, and integrate this cleanup with the server
framework's existing signal handling rather than registering competing handlers in multiple
modules.

## Privacy and security

- Keep `ANVIA_LENS_SECRET_KEY` and provider credentials server-only, scope Lens keys by project,
  rotate them, and prevent them from appearing in logs, build output, screenshots, or client
  bundles.
- Use HTTPS between production workloads and Lens. Restrict project access, configure retention
  and deletion, back up the self-hosted deployment, and include telemetry in incident-response
  planning.
- Prefer stable opaque user and session IDs. Lens telemetry is not authentication,
  authorization, tenant isolation, conversation memory, or a business record.
- Keep production on safe capture unless exporting prompts, responses, tool arguments, and tool
  results has been explicitly approved. Full capture is an opt-in deployment decision.
- If full capture is approved, enable `redactInputs` and `redactOutputs`, add application-specific
  patterns, lower `captureMaxBytes` where appropriate, and test with synthetic data. Redaction and
  truncation reduce exposure but do not guarantee that all sensitive data is removed.

## Production checklist

- [ ] Pin compatible `@anvia/core`, provider, and `@anvia/lens` versions and test upgrades in
  staging.
- [ ] Create one observer per process or worker lifecycle, not one per request.
- [ ] Store Lens and provider secrets in the deployment secret manager and verify rotation.
- [ ] Use stable service, environment, release, trace name, user, and session dimensions.
- [ ] Keep safe capture enabled until access, redaction, retention, and deletion are approved.
- [ ] Keep trace tags and metadata small, low-cardinality, and free of secrets or raw customer
  content.
- [ ] Stop incoming work before awaiting `shutdown()` and fit `timeoutMs` inside the termination
  grace period.
- [ ] Alert on exporter failures and test a controlled request plus `flush()` after network or key
  changes.
- [ ] Treat telemetry failure independently from agent availability unless a specific job requires
  confirmed trace delivery.

## Next steps

- Review [Lens tracing configuration](/lens/connect/anvia/configure-tracing) for every supported
  option and environment variable.
- Add safe [user and session trace context](/lens/connect/anvia/trace-context) to real request
  boundaries.
- Read [capture and privacy](/lens/connect/anvia/capture-and-privacy) before considering payload
  capture.
- Adapt [flush and shutdown](/lens/connect/anvia/flush-and-shutdown) to your server, worker, or
  serverless lifecycle.
- Continue to [Lens evaluations](/lens/evaluations) when you want quality reporting and managed
  datasets in addition to live tracing.

## Tests and source

Use a fake completion model for deterministic observer lifecycle tests. Assert safe capture,
run/generation correlation, error recording, `flush()` in a short-lived job, and one idempotent
`shutdown()`. Keep the deployment smoke test synthetic and verify its trace ID in the expected Lens
project after key or network changes.

- Cookbook source: [`10_integrations/08-lens-native.ts`](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/10_integrations/08-lens-native.ts)
- Adapter tests: [`packages/observability-lens/test`](https://github.com/anvia-hq/anvia/tree/main/packages/observability-lens/test)
