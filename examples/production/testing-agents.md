# Test agents

**Level:** Pattern

## Outcome

Build a testing pyramid that keeps most tests deterministic and fast, then adds a small set of live
provider checks and behavioral evals.

## When to use it

Use this structure for every production agent. Snapshotting one live model answer is fragile and does
not verify authorization, tools, memory, retries, or failure behavior.

## Setup

Install the same Anvia packages as the application plus Vitest. Keep fake models and synthetic
fixtures in test-only modules, and load live provider credentials only in an explicitly selected
smoke-test job.

## Testing pyramid

```text
many: schema, tool, pipeline, lifecycle, and fake-model unit tests
some: database/queue/HTTP adapter integration tests
few: live provider smoke tests and behavioral eval suites
```

## Deterministic model boundary

Implement the public completion contract for unit tests:

```ts
import {
  Agent,
  type CompletionModel,
  type CompletionRequest,
  type CompletionResponse,
  Usage,
} from "@anvia/core";

class StaticModel implements CompletionModel {
  readonly provider = "test";
  readonly modelId = "static";
  readonly capabilities = {
    streaming: false,
    tools: false,
    toolChoice: false,
    imageInput: false,
    documentInput: false,
    outputSchema: false,
    reasoning: false,
  };

  async completion(_request: CompletionRequest): Promise<CompletionResponse> {
    return {
      choice: [{ type: "text", text: "Refunds are available for 30 days." }],
      usage: Usage.empty(),
      rawResponse: { fixture: "refund-policy-v1" },
    };
  }
}

const agent = new Agent({
  id: "support-test",
  model: new StaticModel(),
});
const response = await agent.generate({
    prompt: "What is the refund window?"
});
if (response.status !== "completed") throw new Error("Unexpected approval request");
expect(response.output).toContain("30 days");
```

Use scripted models that emit tool calls to test authorization and tool-result handling. Test tools
as ordinary functions with malformed input, unauthorized IDs, upstream failures, and idempotency.

## Integration and live tests

Run real persistence adapters against disposable databases. Mock provider SDKs in ordinary package
tests. Put live provider smoke tests behind explicit credentials, small budgets, model allowlists,
and non-production data. Do not make live-network tests a prerequisite for every local unit run.

## Failure scenarios to cover

- malformed and oversized prompts;
- cross-tenant memory or tool references;
- provider `429`, `5xx`, timeout, and invalid responses;
- cancellation and retry exhaustion;
- tool failure before and after a side effect;
- concurrent prompts against one session;
- observer/exporter failure and graceful shutdown.

## Security and production adaptations

Never record real credentials, prompts, or trace payloads in fixtures. Use synthetic IDs and scrubbed
documents. Keep golden datasets versioned, require review for expected-output changes, and separate
tests that prove safety boundaries from model-quality evals.

## Expected behavior

Unit tests are deterministic and cheap. Integration tests prove your infrastructure adapters. Smoke
tests detect provider contract drift. Eval suites measure behavioral quality without pretending that
variable prose is a byte-for-byte invariant.

Run deterministic tests on every change, adapter integration tests in CI with disposable services,
and live smoke/eval jobs on a controlled schedule or release boundary.

## Source and extensions

- Static model source: [`10_integrations/08-lens-native.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/10_integrations/08-lens-native.ts)
- Eval source: [`08_evals/04-agent-eval-target.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/08_evals/04-agent-eval-target.ts)
- Continue to [evaluations](/examples/production/evaluations) and [quality gates](/examples/production/quality-gates).
