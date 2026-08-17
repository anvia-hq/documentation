# Vertex AI

Use Vertex mode when Gemini is provisioned through a Google Cloud project. `GeminiClient` still returns the same Anvia model contracts; only client construction and authentication change.

## Configure Application Default Credentials

Set the project, location, and local credential source in the server environment:

```sh
export GOOGLE_CLOUD_PROJECT="my-gcp-project"
export GOOGLE_VERTEX_LOCATION="us-central1"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Create the client with explicit project and location values:

```ts
import { GeminiClient } from '@anvia/gemini'

export const vertexGemini = new GeminiClient({
  vertexAi: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT!,
    location: process.env.GOOGLE_VERTEX_LOCATION ?? 'us-central1',
  },
})

export const model = vertexGemini.completionModel({
    modelId: 'gemini-2.5-flash'
})
```

When `googleAuthOptions` is omitted, the official Google SDK uses Application Default Credentials. In Google-hosted environments, prefer the workload's attached service identity over a long-lived JSON key.

The constructor requires non-empty `project` and `location` values. Validate both at startup instead of relying on implicit environment discovery inside the adapter.

## Use explicit Google authentication

Pass the Google SDK's `googleAuthOptions` when the application owns a trusted credential object or preconfigured authentication behavior:

```ts
const vertexGemini = new GeminiClient({
  vertexAi: {
    projectId: 'my-gcp-project',
    location: 'us-central1',
    googleAuthOptions: {
      credentials: serviceAccountJson,
    },
  },
})
```

Validate externally supplied credential configuration and never commit service-account JSON or private keys. Use short-lived credentials or workload identity where possible.

## Keep Vertex concerns at the model boundary

```ts
import type { CompletionModel } from '@anvia/core'

export function createSupportModel(): CompletionModel {
  return vertexGemini.completionModel({
      modelId: 'gemini-2.5-flash'
  })
}
```

Agent and pipeline code can now depend on `CompletionModel` rather than project IDs, IAM details, or Google SDK types.

## Vertex-specific checks

- Verify that the model is available in the configured project and location.
- Grant the workload only the IAM permissions required for the enabled model operations.
- Test completion, streaming, embeddings, media, and model listing separately when the product uses them.
- Record the Google Cloud project, region, provider, and model as safe operational metadata.
- Treat quota, safety policy, and model availability as deployment-specific behavior.

Local ADC success does not prove that the production workload identity can use the selected model. Run an authenticated smoke test in every deployed environment.
