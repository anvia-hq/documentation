# Choose a provider

Choose from the workflow's actual requirements, not a general model ranking. The useful question is whether one exact model and deployment configuration performs this job reliably inside the product's constraints.

## 1. Start with the required contract

Current Anvia adapters provide these shortlists:

- Text completion, streaming, and tools: OpenAI, Anthropic, Gemini, Mistral, and Grok.
- Core output schemas: OpenAI, Gemini, Mistral, and Grok.
- Image input: OpenAI, Anthropic, Gemini, and Grok.
- File-document input: OpenAI Responses, Anthropic, Gemini, and Grok Responses.
- Embeddings: OpenAI, Gemini, and Mistral.
- Image generation: OpenAI, Gemini, and Grok.
- Audio generation: OpenAI and Grok.
- Transcription: OpenAI, Gemini, and Grok.
- OCR: Mistral.

These are adapter contracts. Verify the exact model ID with the [capability guide](/sdk/providers/capability-matrix) and a live request.

## 2. Apply deployment constraints

Remove candidates that cannot meet non-negotiable requirements:

- allowed region or managed-cloud environment
- organizational retention and training policy
- account access to the required model and feature
- acceptable latency, concurrency, and rate limits
- input types, context size, and output limits
- budget and cost attribution

For example, the Anthropic package supports direct API and Vertex AI clients. Gemini also supports API-key and Vertex configurations. Select that deployment in trusted server configuration, not an agent prompt.

## 3. Evaluate the real workflow

Use representative normal, difficult, and adversarial inputs. Measure correctness, tool selection, argument quality, schema adherence, latency, usage, cost, and errors under expected concurrency.

Run the same instructions, tools, schemas, and eval cases against every candidate. A general benchmark does not prove that a model follows your authorization-sensitive tool contract.

## 4. Prove every used path

For streaming, consume through the terminal event and verify usage.

For tools, exercise automatic selection plus required or forced choice when used.

For structured output, parse realistic difficult cases.

For image or document input, test the real media type and delivery form.

For embeddings and generated media, verify dimensions or bytes, ordering, formats, and storage behavior.

For compatible endpoints, repeat the complete suite; HTTP shape does not imply feature parity.

## 5. Validate minimum completion capability

```ts
import type { CompletionModel } from '@anvia/core'

function assertSupportWorkflow(model: CompletionModel) {
  const capability = model.capabilities

  if (
    !capability.streaming ||
    !capability.tools ||
    !capability.toolChoice
  ) {
    throw new Error(
      'Configured model cannot run the support workflow.',
    )
  }
}
```

Startup checks catch contract mismatches. Evals and live smoke tests catch differences between exact models.

## 6. Keep selection explicit

Validate provider and model IDs in server configuration. Record both in traces so regressions and spend can be attributed.

Use one provider when it satisfies the whole workflow. Mix providers when capability or deployment constraints genuinely differ.

Next, read the [capability declarations](/sdk/providers/capability-matrix).
