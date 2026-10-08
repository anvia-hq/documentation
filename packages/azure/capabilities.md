# Capabilities

`@anvia/azure` is a thin Azure configuration layer over the OpenAI adapters. Completion, embedding, image, speech, and transcription behavior is the same normalized mapping that `@anvia/openai` provides, applied to Azure deployments.

| Capability | Support |
| --- | --- |
| Responses completion and streaming | Yes (`api: 'responses'`) |
| Chat Completions and streaming | Yes (default) |
| Local Anvia tools and tool choice | Yes |
| Structured output | Where the deployment supports it |
| Reasoning content | Where the deployment supports it |
| Embeddings | Yes |
| Image generation, speech, transcription | Where the deployment supports them |
| Model listing | Endpoint model list, as `azure-openai` |
| API-key authentication | Yes |
| Microsoft Entra token provider | Yes |
| Injected OpenAI SDK client | Yes |
| Azure v1 endpoints (`/openai/v1/`) | Yes |
| Foundry project endpoints | Yes, through `baseUrl` |

Which APIs, tools, media options, and listing results work depends on your Azure endpoint and deployment. `listModels()` calls the endpoint's model listing API; it does not enumerate Azure Resource Manager deployments.

## Azure Responses behavior

The Responses model extends the shared adapter that `@anvia/openai/adapters` exports and adds two Azure-specific behaviors:

- **Message item types.** Conversation messages are sent with an explicit `type: "message"`, which Foundry project endpoints require and resource endpoints accept. Function-call and tool-result items keep their own shapes.
- **Terminal tool-argument names.** Azure streams may omit the function name from the terminal `response.function_call_arguments.done` event. The model resolves it from the earlier function-call item with the same item ID, keeping state local to each stream so parallel tool calls stay separate. A missing identity is rejected with a provider output error of kind `invalid-tool-call`, and a conflicting name is rejected rather than overwritten.

Completed tool calls remain validated by the shared parser. Final-only or encrypted reasoning that arrives only in the terminal Responses event, including on Azure streams, is retained by Core for later turns.

## Provider identities

| Surface | Identity |
| --- | --- |
| Completion, embedding, media handles | `azure-openai` |
| Chat Completions request trace | `azure-openai-chat` |
| Responses request trace | `azure-openai-responses` |
| Model listing errors | `azure-openai` |

## Not included

The package does not implement AI SDK-style Azure file-ID prefix inference, hosted-tool helpers, Azure Speech or MAI adapters, deployment management, or automatic credential discovery from environment variables.
