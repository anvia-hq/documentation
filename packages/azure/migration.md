# Migrate from `@anvia/openai`

Applications that reached Azure through `OpenAIClient` with a custom `baseUrl` can move to `AzureOpenAIClient`. Existing `@anvia/openai` custom endpoints remain supported, but Azure Responses event normalization belongs to `AzureOpenAIClient`.

## Swap the client

```ts
// Before
import { OpenAIClient } from '@anvia/openai'
const client = new OpenAIClient({ apiKey, baseUrl: azureBaseUrl })

// After
import { AzureOpenAIClient } from '@anvia/azure'
const client = new AzureOpenAIClient({ apiKey, baseUrl: azureBaseUrl })
```

Replace the import, keep your Azure `baseUrl` and `apiKey` (or switch to `endpoint` and an Entra `azureADTokenProvider`), and keep the same model-handle calls. Use Azure credential variable names, such as `AZURE_OPENAI_API_KEY`, to keep the two providers separate.

## What changes

- Provider identity becomes `azure-openai` (and `azure-openai-chat` or `azure-openai-responses` in request traces) instead of `openai`, so telemetry separates the providers.
- The Responses model resolves an omitted terminal function name from the earlier function-call item with the same item ID, per stream. Missing identities and conflicting names are rejected.
- Azure Responses requests tag conversation messages with `type: "message"` for Foundry project endpoints, preserving function-call and tool-result item shapes.
- SDK retries are disabled on the managed client.

OpenAI's own parser accepts an unnamed arguments-done event without synthesizing a name and validates the name on the completed function call. Azure's behavior is layered on through `@anvia/openai/adapters`, so request mapping, tool-result serialization, argument validation, and stream completion checks remain shared.

## Build a similar provider

Provider packages that implement an OpenAI-shaped Responses endpoint can reuse the protocol adapter:

```ts
import { OpenAIResponsesCompletionModel } from '@anvia/openai/adapters'
```

`OpenAIResponsesCompletionModel` exposes two protected extension points: `normalizeStream(stream)` to adapt endpoint-specific stream events before they are mapped, and `requestParams(request)` to adapt the outgoing request. Subclasses can also override `provider` and `traceRequest()`. The `adapters` subpath currently exports only this class; ordinary applications should keep using the root entry point.
