# Vertex AI

`AnthropicVertexClient` runs the shared Anthropic completion adapter through Anthropic’s official Vertex SDK.

```ts
import { AnthropicVertexClient } from '@anvia/anthropic'

const vertex = new AnthropicVertexClient({
  projectId: 'my-gcp-project',
  region: 'global',
})

const model = vertex.completionModel('claude-sonnet-5')
```

## Authentication

The official SDK follows Google authentication conventions. Environment-based setup can use:

```sh
export ANTHROPIC_VERTEX_PROJECT_ID='my-gcp-project'
export CLOUD_ML_REGION='global'
export GOOGLE_APPLICATION_CREDENTIALS='/absolute/path/service-account.json'
```

Application Default Credentials are preferable to embedding service-account JSON in application configuration. Never commit credential files.

Custom authentication options from the official SDK are also accepted:

```ts
const vertex = new AnthropicVertexClient({
  projectId: 'my-gcp-project',
  region: 'global',
  googleAuth,
})
```

The option type also permits an already configured `AnthropicVertex` client.

## Behavioral differences

- `completionModel()` defaults to `claude-sonnet-5`, not the standard client’s older default.
- The returned completion model has the same Anvia request and stream contracts.
- `AnthropicVertexClient` does not implement `listModels()` because Vertex does not expose Anthropic’s Models API through this client.
- Available IDs, regions, quotas, and authentication failures are governed by the Vertex deployment.

## Production considerations

- Validate the project and region at startup.
- Give the workload identity only required Vertex permissions.
- Avoid passing externally supplied credential objects without validation.
- Record project/region as safe deployment metadata, not secrets.
- Test streaming and tool use in the target region.
- Do not assume an Anthropic API model ID is available through Vertex under the same name.
