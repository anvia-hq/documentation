# What can I build with Anvia?

You can build TypeScript application features that need one or more model calls, tools, memory, retrieval, structured data, or streamed interaction. Anvia is useful for both user-facing experiences and server-side workflows.

Common examples include:

- Support or operations assistants that call application tools.
- Search and question-answering over private documents.
- Structured extraction and classification pipelines.
- Chat, completion, and multimodal interfaces.
- Background workflows that combine deterministic steps with agents.
- Evaluation and observability workflows around model behavior.
- Multi-agent systems where the added coordination is justified.

You do not need an agent for every feature. A one-call summarizer may only need [direct completions](/sdk/completions), while a schema-validated extraction flow may use [structured output](/sdk/structured-output). Use [agents](/sdk/agents) when the behavior needs reusable instructions, tools, multiple turns, memory, or run-level controls. Use [pipelines](/sdk/pipelines) when the workflow has explicit stages and typed transitions.

Anvia does not supply your application data or product decisions. A customer-support agent still needs application-owned tools with authorization checks. A knowledge assistant still needs an ingestion strategy, storage, metadata policy, and source permissions. A production chat still needs an authenticated server route and a user interface.

For local inspection, add [Studio](/studio/). For production traces and evaluation workflows, consider [Lens](/lens/). Browse the [package catalog](/packages/catalog) to see the available provider and infrastructure integrations.
