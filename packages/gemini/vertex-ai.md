# Vertex AI

Select Vertex by setting the discriminant `vertexai: true`:

```ts
const vertex = new GeminiClient({
  vertexai: true,
  project: 'my-gcp-project',
  location: 'us-central1',
})
```

The returned factories use the same Anvia model contracts as Gemini API-key mode.

## Authentication

The official Google GenAI SDK follows Application Default Credentials. A service-account file can be selected through:

```sh
export GOOGLE_APPLICATION_CREDENTIALS='/absolute/path/service-account.json'
```

Trusted credentials can be passed through `googleAuthOptions`, but never accept an arbitrary credential object from an untrusted request.

## Project and location

Anvia requires both values when constructing the client. Model families and media APIs may have different regional availability. Validate every factory in the deployment region rather than assuming parity with the Gemini Developer API.

## Production considerations

- Prefer workload identity or Application Default Credentials.
- Grant only the required Vertex permissions.
- Keep project and region in deployment configuration.
- Test model listing because returned identifiers and metadata can differ.
- Confirm whether image generation and Imagen are enabled in the region.
- Record the serving platform in traces without exporting credentials.

## Switching modes

The agent and pipeline code can keep the same Anvia model interface. Swap the constructed client at the application boundary:

```ts
const client = useVertex
  ? new GeminiClient({ vertexai: true, project, location })
  : new GeminiClient({ apiKey })

const model = client.completionModel(configuredModelId)
```

Do not assume one model ID is served identically by both platforms. Treat a platform switch as a provider migration and replay representative tests.
