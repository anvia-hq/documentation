# Errors and limits

Bound every production agent and translate runtime failures at the application runner—not inside prompt text.

## Common failures

| Failure | Typical cause | Application response |
| --- | --- | --- |
| `MaxTurnsError` | The model-and-tool loop exceeded its limit. | Return a retry or escalation response. |
| `PromptCancelledError` | A hook cancelled the run. | Return the cancellation reason when safe. |
| `ToolApprovalRequiredError` | A sensitive tool requires a decision. | Create or resume an approval flow. |
| Capability error | The model lacks a requested feature. | Fail fast or choose a compatible model. |
| Tool error | Product code rejected input or failed. | Map it to a safe domain error. |
| Provider error | Upstream timeout, rate limit, auth, or validation failure. | Retry only safe transient failures. |

## Set turn limits

```ts
const agent = new AgentBuilder('support', model)
  .instructions('Use tools only when needed.')
  .defaultMaxTurns(3)
  .build()

const response = await agent
  .prompt(input)
  .maxTurns(2)
  .send()
```

If runs often reach the limit, improve instructions, tool descriptions, or tool output before increasing it. More turns increase latency and cost and may hide a loop.

## Retry transient model failures

```ts
const response = await agent
  .prompt(input)
  .withCompletionRetries({
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 1_000,
  })
  .send()
```

This retries only the failed model invocation in its current turn. It does not restart the run or replay completed tools. For streams, retry stops after the first non-error provider event to avoid duplicate output.

Do not retry authentication, permission, invalid-request, or schema errors. Make side-effect tools idempotent before enabling any wider application or job retries.

## Centralize error mapping

```ts
try {
  return await runSupportTurn(input)
} catch (error) {
  return mapSupportError(error)
}
```

Return product-safe messages to users. Keep diagnostic provider and tool details in protected logs, traces, or event records.
