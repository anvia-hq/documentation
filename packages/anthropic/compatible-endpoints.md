# Compatible endpoints

Use `baseUrl` when a service exposes an Anthropic-compatible Messages API:

```ts
const client = new AnthropicClient({
  apiKey: process.env.PROVIDER_API_KEY!,
  baseUrl: 'https://provider.example.com',
})

const model = client.completionModel({
    modelId: 'provider/model-name'
})
```

## What compatibility must include

A useful completion endpoint must accept the Anthropic SDK’s Messages request and return compatible non-streaming or streaming shapes. Support varies for:

- system instructions;
- image content;
- tools, tool choice, and parallel calls;
- reasoning or thinking blocks;
- usage reporting;
- stop reasons and errors;
- model listing.

The adapter cannot repair an endpoint that only resembles the Messages API. Test every feature the agent uses.

## Model listing is separate

`AnthropicClient.listModels()` calls the configured client’s Models API. A compatible service may implement Messages but omit Models. Treat a listing failure separately from completion availability.

## Migration testing

Before moving an existing Anthropic agent to a compatible endpoint:

1. Replay representative text and image inputs.
2. Exercise single and parallel tool calls.
3. Verify malformed arguments fail safely.
4. Compare usage and finish reasons.
5. Test stream cancellation and provider errors.
6. Confirm subsequent tool-result turns preserve required content.

Keep endpoint-specific fields in `providerOptions` and isolate them at provider construction or request policy boundaries.
