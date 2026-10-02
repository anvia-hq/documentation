# Guardrails

Guardrails evaluate model-facing input and output. They can allow, block, or rewrite text; tool authorization and human approval remain separate enforcement boundaries.

## Define input and output policies

The public factories are available from `@anvia/core` and `@anvia/core/guardrails`:

```ts anvia-check
import { defineGuardrailPolicy, defineOutputGuardrail, guardrails } from '@anvia/core/guardrails'

const supportPolicy = defineGuardrailPolicy({
  id: 'support-policy',
  mode: 'enforce',
  input: [
    guardrails.blockText({
      id: 'reject-internal-marker',
      boundary: 'input',
      patterns: ['INTERNAL_ONLY'],
      reason: 'internal_input',
      message: 'Please provide a customer-facing question.',
    }),
  ],
  output: [
    guardrails.redactText({
      id: 'redact-demo-secret',
      boundary: 'output',
      patterns: [/DEMO_SECRET_[A-Z0-9]+/g],
      reason: 'demo_secret',
      replacement: '[redacted]',
    }),
    defineOutputGuardrail({
      id: 'non-empty-answer',
      check({ outputText }, actions) {
        return outputText.trim()
          ? actions.allow()
          : actions.block({ reason: 'empty_answer', message: 'No answer was available.' })
      },
    }),
  ],
})
```

Attach the policy as `new Agent({ id, model, guardrails: supportPolicy })`, or pass `guardrails` to `generate()` or `stream()`. Run-level policies are appended to the agent policies. Arrays allow several policies to run in order.

The demonstration marker is a narrow example, not a complete secret detector. Choose patterns and application checks for the data you actually handle.

## Understand stages and actions

Input checks receive `prompt`, `history`, `inputText`, and run identity. Use `defineInputGuardrail()` for application-specific checks. An enforced input block returns `{ type: 'blocked', stage: 'input', ... }` before the main model call.

Output checks receive `outputText`, messages, usage, and run identity. They evaluate the final answer; an enforced output block returns a `blocked` outcome with `stage: 'output'`. Neither block is a provider exception. Handle `blocked` alongside `response` and `interaction` at the application boundary.

Custom checks return `actions.allow()`, `actions.block({ reason, message? })`, or a rewrite. Input rewrites accept `inputText` or a user `prompt`; output rewrites accept `outputText`. Later checks see applied rewrites. Returning `undefined` allows the check to leave the value unchanged.

With structured agent output, a rewritten final answer still has to parse and satisfy `outputSchema`. Replacing JSON with arbitrary text can cause structured-output failure; design output rewrites to preserve the schema or block the response.

## Observe before enforcing

`mode: 'enforce'` is the default. `mode: 'observe'` records decisions without applying blocks or rewrites. Evaluate observed decisions before enabling enforcement; observe mode does not protect the output.

Outcomes expose decision records in `guardrails`, and streams emit `guardrail_decision`. Each record includes policy and guardrail IDs, boundary, mode, action, whether it was applied, reason, and latency. Store safe operational details rather than raw private text. A thrown check error fails an enforcing run. Observe mode records it as an unapplied `error` decision and continues.

## Account for streaming

An enforced output policy buffers text and reasoning deltas until the output decision is available. Visible output therefore arrives later. An agent `outputSchema` also buffers response events for validation. Other events, such as tool activity, still require application filtering before transport to a browser.

Guardrails do not redact every message, tool result, trace, or provider request. Redact those at their owning boundaries. Enforce permissions inside tool handlers, and use [tool approval](/sdk/advanced/hooks/tool-control) for protected side effects.

Continue with [observability](/sdk/observability) to record decisions and run outcomes.
