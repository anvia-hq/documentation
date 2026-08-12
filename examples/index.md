# Examples

Build with Anvia through recipes, reusable patterns, and complete application walkthroughs. The examples use the current SDK and point to runnable source in the Anvia repository wherever a matching cookbook or full project exists.

## Choose a learning path

### Learn Anvia in one hour

1. [Send a text completion](/examples/essentials/basic-completion).
2. [Stream a completion](/examples/essentials/streaming-completion).
3. [Build your first agent](/examples/essentials/first-agent).
4. [Give the agent a typed tool](/examples/essentials/agent-with-tools).
5. [Return validated structured data](/examples/essentials/structured-output).
6. [Continue a conversation with memory](/examples/essentials/conversation-memory).

### Build an application

Start with [streaming React chat](/examples/applications/streaming-react-chat), then choose a product pattern:

- [Customer-support assistant](/examples/applications/customer-support-rag) with authenticated, permission-aware retrieval.
- [Research assistant](/examples/applications/research-assistant) with parallel specialists and a structured report.
- [Document analyst](/examples/applications/document-analyst) with ingestion, extraction, and review boundaries.
- [CLI agent](/examples/applications/cli-agent) with workspace tools and durable sessions.
- [Operations assistant](/examples/applications/operations-assistant) with MCP, approvals, and sandbox boundaries.

### Prepare for production

Begin with [authentication](/examples/production/authentication), [rate limits](/examples/production/rate-limits), and [retries and timeouts](/examples/production/retries-and-timeouts). Move long work to [durable jobs](/examples/production/durable-jobs), add [agent tests](/examples/production/testing-agents) and [quality gates](/examples/production/quality-gates), then select [Lens](/examples/production/tracing-with-lens), [OpenTelemetry](/examples/production/open-telemetry), or [Langfuse](/examples/production/langfuse) for observability.

## Example levels

- **Recipe** isolates one capability in a small runnable program.
- **Pattern** combines several capabilities around a realistic boundary and explains application ownership.
- **Application** lays out a multi-file project, request flow, failure behavior, security decisions, tests, and production changes.

Documentation excerpts emphasize the important boundaries. A page links to repository source when an equivalent runnable implementation exists; it does not describe an isolated excerpt as a complete project.

## Browse by capability

### Agents and tools

Learn [tool calling](/examples/agents-and-tools/tool-calling), then add [permissions](/examples/agents-and-tools/tool-permissions), [approval](/examples/agents-and-tools/tool-approval), [dynamic selection](/examples/agents-and-tools/dynamic-tools), [middleware](/examples/agents-and-tools/tool-middleware), and [cancellation](/examples/agents-and-tools/cancellation). Continue with [agents as tools](/examples/agents-and-tools/agent-as-tool) and [parallel specialists](/examples/agents-and-tools/parallel-agents).

### Knowledge and data

Start with [basic RAG](/examples/knowledge-and-data/basic-rag), enforce access with [permission-aware retrieval](/examples/knowledge-and-data/permission-aware-rag), and build ingestion with [document loading](/examples/knowledge-and-data/document-ingestion) and [metadata filters](/examples/knowledge-and-data/metadata-filters). For stateful systems, compare [persistent memory](/examples/knowledge-and-data/persistent-memory) with [multi-tenant memory](/examples/knowledge-and-data/multi-tenant-memory), then choose a [vector-store adapter](/examples/knowledge-and-data/vector-store-adapters).

### Workflows

Use pipelines for [document extraction](/examples/data-and-workflows/document-extraction-pipeline), [research](/examples/data-and-workflows/research-pipeline), [parallel work](/examples/data-and-workflows/parallel-pipeline), and [bounded batches](/examples/data-and-workflows/batch-processing). The production patterns explain [background workers](/examples/data-and-workflows/background-workers), [human review](/examples/data-and-workflows/human-review), and [failure recovery](/examples/data-and-workflows/failure-recovery).

### Providers and media

Compare [provider switching](/examples/providers-and-media/provider-switching) and [compatible APIs](/examples/providers-and-media/compatible-apis). Then work with [images](/examples/providers-and-media/image-understanding), [PDFs](/examples/providers-and-media/pdf-analysis), [image generation](/examples/providers-and-media/image-generation), [speech and transcription](/examples/providers-and-media/speech-and-transcription), [Mistral OCR](/examples/providers-and-media/mistral-ocr), or [Grok live search](/examples/providers-and-media/grok-live-search).

## Examples, guides, and reference

- Use **Examples** when you want an implementation and its engineering tradeoffs.
- Use the [SDK documentation](/sdk/) when you need exact runtime behavior and configuration.
- Use [Packages](/packages/) when selecting an adapter or checking its public API.
- Use [FAQs](/faqs/) when deciding whether Anvia fits your architecture.
