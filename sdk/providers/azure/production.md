# Production checklist

Treat the Azure client as infrastructure and each deployment as a tested application dependency.

## Configuration

- Keep keys, token providers, and clients in server-only modules.
- Prefer Microsoft Entra tokens (`azureADTokenProvider`) over long-lived keys where your platform supports managed identity.
- Select the token scope for the endpoint: `https://cognitiveservices.azure.com/.default` for resources and `https://ai.azure.com/.default` for Foundry projects.
- Use Azure-specific variable names (`AZURE_OPENAI_*`) so OpenAI and Azure configuration cannot be mixed up.
- Keep deployment names in trusted configuration and allow-list the ones users may select.
- Declare `contextLimits` and `controls` for custom deployment names.

## Capability tests

- Smoke test the exact endpoint, API (`responses` or `chat`), and deployment.
- Exercise `agent.generate()` and `agent.stream()` if the product uses both, including a tool call with complete streamed arguments.
- Validate output-schema behavior before relying on parsed product data.
- Test embeddings and media with representative input against their own deployments.
- Treat model listing as endpoint inventory, not proof of a working deployment.

## Reliability

- The managed client disables SDK retries. Bound request time, retries, and concurrency in your Agent or application policy.
- Retry only transient failures and use idempotency around downstream writes.
- Avoid silently switching provider, API, or deployment after a failure.
- Record `azure-openai` and the deployment in traces so regressions and spend can be attributed.

## Migrating from `OpenAIClient`

If you previously pointed `OpenAIClient` at Azure with `baseUrl`, move to `AzureOpenAIClient` and keep the same model-handle calls. The existing custom-endpoint path still works but does not include Azure Responses event normalization. See [Migrate from `@anvia/openai`](/packages/azure/migration).

## Security and data

- Azure data handling, region, and retention are set by your Azure resource and deployment, not by Anvia.
- Do not log prompts, tool arguments, or credentials by default.
- Keep authorization in tools and application code, not in the model's instructions.
