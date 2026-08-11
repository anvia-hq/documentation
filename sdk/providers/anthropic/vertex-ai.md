# Vertex AI

Use `AnthropicVertexClient` when Claude is provisioned through Google Vertex AI. It returns the same `AnthropicCompletionModel` used by the direct client, so agents and completions do not need Vertex-specific code.

## Configure Application Default Credentials

Set the project, region, and credentials in the server environment:

```sh
export ANTHROPIC_VERTEX_PROJECT_ID="my-gcp-project"
export CLOUD_ML_REGION="global"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Then create the client:

```ts
import { AnthropicVertexClient } from '@anvia/anthropic'

export const vertexAnthropic = new AnthropicVertexClient({
  projectId: process.env.ANTHROPIC_VERTEX_PROJECT_ID,
  region: process.env.CLOUD_ML_REGION ?? 'global',
})

export const model = vertexAnthropic.completionModel(
  'claude-sonnet-5',
)
```

The official Vertex SDK resolves Application Default Credentials. In Google-hosted environments, prefer the workload's attached service identity over a long-lived JSON key.

## Use explicit Google authentication

`AnthropicVertexClient` also accepts the official Vertex SDK's `googleAuth`, `authClient`, `accessToken`, and transport options. This is useful for service-account impersonation or an application-managed authentication client.

```ts
import { GoogleAuth } from 'google-auth-library'
import { AnthropicVertexClient } from '@anvia/anthropic'

const googleAuth = new GoogleAuth({
  credentials: serviceAccountJson,
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
})

const vertexAnthropic = new AnthropicVertexClient({
  projectId: 'my-gcp-project',
  region: 'global',
  googleAuth,
})
```

Install `google-auth-library` directly when application code imports it. Validate externally supplied credential objects and never commit service-account JSON.

## Vertex-specific boundaries

- Construction fails when neither `region` nor `CLOUD_ML_REGION` is available.
- Model availability and model IDs depend on the configured Vertex project and region.
- Vertex credentials, IAM permissions, quotas, and provider failures surface through the official SDK.
- Model listing is not available on `AnthropicVertexClient`.

Run an authenticated startup check or smoke test in each deployment environment. Local ADC success does not prove that the production workload identity has access to the selected Claude model.

