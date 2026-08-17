# How should I test agent behavior?

Use several layers. TypeScript and unit tests verify deterministic contracts; evaluation cases and live-provider tests verify model-dependent behavior.

## Deterministic tests

Test tools, middleware, authorization, retrieval filters, pipeline steps, error translation, and persistence adapters as ordinary application code. Use a test implementation of the completion-model contract when the test is about orchestration rather than provider behavior.

Also test the negative paths: denied tools, approval-required continuations, rejected approval decisions, turn limits, iterator cancellation, partial streaming failures, retry classification, duplicate job delivery, and unauthorized session or resume cursors.

## Evaluation suites

Create stable cases for important product behaviors, known failures, tool selection, structured output, retrieval quality, policy boundaries, and regressions discovered in production. Record useful evidence and expected outcomes without pretending one small suite proves general safety.

## Live-provider checks

Run a credential-gated suite against the exact provider, endpoint, model ID, account, region, and parameters used in production. Test capabilities the application depends on, such as streaming tool arguments or schema adherence.

## Release decisions

Compare results across candidate releases, set a small number of owned quality gates, and retain the underlying cases so a failure can be investigated. Keep deterministic security and authorization tests outside model-scored evaluations. A metric threshold should support a human release policy, not replace it.

See [Lens evaluations](/lens/evaluations), [what to evaluate](/lens/evaluations/what-to-evaluate), [quality gates](/lens/evaluations/quality-gates), and the [provider capability matrix](/sdk/providers/capability-matrix). Use [compatible-endpoint testing](/sdk/providers/compatible/testing) when a custom OpenAI- or Anthropic-shaped endpoint is in scope.
