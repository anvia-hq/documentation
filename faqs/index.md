# Frequently asked questions

Understand what Anvia provides, where it fits in a TypeScript application, and how it differs from other AI development tools.

## Start with your question

| Question | Answer |
| --- | --- |
| What is Anvia? | A composable TypeScript runtime for provider-neutral AI behavior inside application code. [Learn the boundary](/faqs/understanding/what-is-anvia). |
| Why use it? | To share explicit contracts across models, agents, tools, memory, retrieval, pipelines, streaming, and observability without giving a framework ownership of the surrounding application. [Why Anvia](/faqs/choosing/why-anvia). |
| How does it compare with other TypeScript tools? | The best choice depends on whether the product needs a model/UI toolkit, an integrated agent framework, an autonomous harness, or an application-owned runtime. [Compare the stacks](/faqs/comparisons/). |
| Do I need Studio or Lens? | No. Both are optional products around the SDK: Studio is a local development console, while Lens is an observability and evaluation workspace. [Understand the products](/faqs/studio-and-lens/do-i-need-studio-or-lens). |
| Is it production-ready? | The runtime provides production-oriented controls, but the application still owns deployment, authentication, authorization, data policy, and operational reliability. [Read the production answer](/faqs/production/is-anvia-production-ready). |
| Does it work with Bun? | Node.js is the currently tested and supported runtime. Bun may work for some packages, but official support will follow dedicated compatibility testing. [Read the Bun answer](/faqs/production/bun-support). |

## Explore by topic

### Understanding Anvia

Start with [what Anvia is](/faqs/understanding/what-is-anvia), [how it is structured](/faqs/understanding/how-anvia-is-structured), and [what the application still owns](/faqs/understanding/application-ownership). The boundary is as important as the feature list.

### Choosing a stack

Read the [capability overview](/faqs/choosing/capability-overview), then compare Anvia with [Vercel AI SDK](/faqs/comparisons/vercel-ai-sdk), [Mastra](/faqs/comparisons/mastra), [VoltAgent](/faqs/comparisons/voltagent), [Flue](/faqs/comparisons/flue), or [direct provider SDKs](/faqs/comparisons/direct-provider-sdks).

### Runtime capabilities

Decide between [completions and agents](/faqs/capabilities/completions-or-agents), [memory and knowledge](/faqs/capabilities/memory-or-knowledge), or [pipelines and agents](/faqs/capabilities/pipelines-or-agents). Separate pages cover tools, multi-agent systems, structured output, streaming, and sandbox execution.

### Studio and Lens

Learn what [Studio](/faqs/studio-and-lens/what-is-studio) and [Lens](/faqs/studio-and-lens/what-is-lens) are designed to do—and why Studio is not a production operations console.

### Production architecture

Review [security ownership](/faqs/production/authentication-and-authorization), [deployment](/faqs/production/deploying-anvia), [Bun support](/faqs/production/bun-support), [persistence](/faqs/production/persistence), [retries and cancellation](/faqs/production/retries-and-cancellation), and [testing agent behavior](/faqs/production/testing-agent-behavior).

## Quick answers

### Is Anvia tied to OpenAI?

No. Core depends on provider-neutral model contracts. Provider packages adapt OpenAI, Anthropic, Gemini, Mistral, Grok, and supported compatible endpoints. Model capabilities still vary by provider, account, region, endpoint, and model ID.

### Do I need an agent for every model call?

No. Use a direct completion for one model request. Use an agent when reusable behavior needs tools, context, memory, hooks, or multiple bounded turns.

### Does a tool schema provide authorization?

No. A schema validates the arguments a model produced. Application code must authenticate the caller and authorize the requested operation.

### Does a memory scope authorize a session?

No. Scope determines which conversation is loaded. The application must still verify that the caller can access that user, tenant, and session.

### Where should provider keys live?

On the server or trusted worker. Browser clients should call an authenticated application route that runs the model or agent and returns an appropriate stream.

### How do I inspect an agent locally?

Register it with [`@anvia/studio`](/studio/), start the local runtime, and inspect its tools, context, sessions, traces, and configured capabilities in the browser.
