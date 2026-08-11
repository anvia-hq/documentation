# Capture and privacy

Lens tracing uses safe capture by default. Start there, then opt into payload capture only for data your application is allowed to export and retain.

## Safe capture is the default

```ts
const tracing = lens.create()
```

Safe capture records the operational shape of a run—its agent, generations, tools, timing, status, model details, and token usage—without traced prompt and response bodies.

It is the right default for production applications that may process customer content, credentials, private documents, or regulated data. It still exports trace context you explicitly add through `.withTrace()`, so keep tags and metadata safe as well.

## Enable full capture deliberately

```ts
const tracing = lens.create({
  captureMode: 'full',
})
```

Full capture adds input and output data to the trace. Depending on what the run uses, that can include agent instructions, prompt history, generation input and output, tool arguments and results, documents, schemas, provider requests, and child-agent content.

Use it when seeing payloads is necessary for debugging or review and your retention and access policies permit those values to leave the agent process.

## Redact captured values

Redaction is opt-in and directional:

```ts
const tracing = lens.create({
  captureMode: 'full',
  redactInputs: true,
  redactOutputs: true,
})
```

The built-in redactor replaces matching values for:

- Email addresses.
- Bearer credentials.
- Common `sk-`, `sk_`, `pk-`, and `pk_` key shapes.
- Payment-card-like number sequences.

Redaction walks strings inside arrays and objects without mutating the original value. It is a useful final safeguard, not a guarantee that every sensitive value will match a pattern.

Add application-specific patterns when the default set does not cover your identifiers:

```ts
const tracing = lens.create({
  captureMode: 'full',
  redactInputs: true,
  redactOutputs: true,
  redaction: {
    replacement: '[removed]',
    patterns: [
      {
        name: 'customer-secret',
        regex: /cust_secret_[a-z0-9]+/gi,
      },
      {
        name: 'internal-case',
        regex: /CASE-\d{6}/g,
      },
    ],
  },
})
```

Providing `patterns` replaces the built-in pattern list. Include any default categories you still require, or import `DEFAULT_PATTERNS`:

```ts
import { DEFAULT_PATTERNS, lens } from '@anvia/lens'

const tracing = lens.create({
  captureMode: 'full',
  redactInputs: true,
  redactOutputs: true,
  redaction: {
    patterns: [
      ...DEFAULT_PATTERNS,
      { name: 'customer-secret', regex: /cust_secret_[a-z0-9]+/gi },
    ],
  },
})
```

## Limit captured value size

Each captured value is limited to 256 KiB by default. Lower the limit when large prompts, tool results, or documents would add unnecessary storage and network cost:

```ts
const tracing = lens.create({
  captureMode: 'full',
  captureMaxBytes: 64 * 1024,
  redactInputs: true,
  redactOutputs: true,
})
```

Values larger than the limit are truncated. The minimum accepted value is 96 bytes. Treat the limit as a storage control, not a privacy control: sensitive text can still appear before truncation.

## Use different policies by environment

Keep production safe unless full payload export has been approved. A common pattern is to use full, redacted capture only in a controlled development environment:

```ts
const isDevelopment = process.env.NODE_ENV === 'development'

const tracing = lens.create({
  captureMode: isDevelopment ? 'full' : 'safe',
  redactInputs: isDevelopment,
  redactOutputs: isDevelopment,
  captureMaxBytes: 64 * 1024,
})
```

Do not use a user-controlled value to switch capture mode for an individual request. Capture policy should be an application or deployment decision.

## Evaluation payloads are separate

The Lens evaluation reporter omits case payloads and metadata by default. `captureMode: 'full'` does not automatically enable them. Evaluation reporting has separate `includePayloads` and `includeMetadata` options so the two data decisions stay independent.

See [Evaluations](/lens/evaluations) for that workflow instead of broadening tracing capture only to inspect evaluation cases.

## Production review

Before enabling full capture:

1. Use synthetic data to inspect exactly what arrives in trace detail.
2. Redact sensitive input and output values before export.
3. Confirm project membership and roles match the data classification.
4. Set an appropriate retention and deletion policy.
5. Check that trace metadata and tags do not carry sensitive payloads around the capture policy.

Once the capture policy is settled, make delivery reliable with [Flush and shutdown](/lens/connect/anvia/flush-and-shutdown).

