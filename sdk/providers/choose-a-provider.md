# Choose a provider

Choose a provider from the workflow's requirements, not from a model leaderboard alone. The useful question is: which exact model and deployment configuration can perform this job reliably inside your product constraints?

## Start with the required capability

| Workflow needs | Current Anvia candidates |
| --- | --- |
| Text completion, streaming, and tools | OpenAI, Anthropic, Gemini, Mistral, or Grok |
| Structured output schema | OpenAI, Gemini, Mistral, or Grok |
| Image input in a completion | OpenAI, Anthropic, Gemini, or Grok |
| Native document-file input | OpenAI Responses, Anthropic, Gemini, or Grok Responses |
| Embeddings | OpenAI, Gemini, or Mistral |
| Image generation | OpenAI, Gemini, or Grok |
| Audio generation | OpenAI or Grok |
| Transcription | OpenAI, Gemini, or Grok |
| OCR | Mistral |

This is an adapter-level shortlist. Confirm support for the exact model ID in the [capability matrix](/sdk/providers/capability-matrix) and with a live request.

## Apply deployment constraints

Remove candidates that cannot meet non-negotiable product requirements:

- the region or managed-cloud environment where requests must run
- data retention and training policies required by your organization
- account access to the chosen model and features
- acceptable latency, rate limits, and concurrency
- supported input types, maximum context, and output limits
- budget and cost-accounting requirements

For example, `@anvia/anthropic` can connect directly to Anthropic or use `AnthropicVertexClient` for Claude on Vertex AI. `@anvia/gemini` supports Gemini API and Vertex AI configurations. Make this deployment choice in server configuration rather than inside the agent prompt.

## Evaluate the real workflow

Compare a small number of candidates with representative inputs. Measure what matters to the product:

1. Correctness on normal and difficult examples.
2. Tool-call selection and argument quality.
3. Schema adherence and recovery behavior.
4. Time to first token and total latency.
5. Input, output, cache, and reasoning-token usage where reported.
6. Error rate under expected concurrency.

Use the same instructions, tools, schemas, and evaluation cases for every candidate. A generic benchmark cannot tell you whether a model follows your authorization-sensitive tool contract or returns your schema consistently.

## Prove capabilities with smoke tests

Run a small live suite against each production configuration:

| If the workflow uses | Test |
| --- | --- |
| Streaming | Consume the stream through its final event and verify usage. |
| Tools | Exercise an automatic call and any required or forced tool choice. |
| Structured output | Parse a realistic schema, including a difficult case. |
| Image or document input | Send the real media type and delivery form: bytes, URL, or provider file. |
| Embeddings | Verify vector size, batching, and input-order preservation. |
| Generated media | Verify output bytes, format, size, and storage handling. |
| Compatible endpoint | Repeat every capability test; HTTP compatibility is not feature parity. |

Model listing only proves that an endpoint returned inventory. It does not prove tools, schemas, streaming, or media support.

## Separate primary and fallback selection

A fallback must satisfy the minimum contract of the workflow. Do not choose it solely because it can produce text.

```ts
import type { CompletionModel } from '@anvia/core'

function assertSupportWorkflow(model: CompletionModel) {
  const required = model.capabilities

  if (!required.streaming || !required.tools || !required.toolChoice) {
    throw new Error('Configured model cannot run the support workflow')
  }
}
```

Capability checks catch adapter-level mismatches at startup. Evals and live smoke tests catch behavioral differences between models.

## Prefer explicit selection

Keep provider and model IDs in validated server configuration. Record the selected provider and model in traces so regressions and spend can be attributed correctly.

Use one default when it meets the whole workflow. Use multiple providers when capabilities or deployment constraints genuinely differ—for example, one completion model for the agent, another model for evaluation, and a dedicated embedding or OCR model for ingestion.

