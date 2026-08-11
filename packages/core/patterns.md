# Patterns

Use the smallest composition that preserves clear ownership.

## One model call

```ts
const result = await createCompletion(model, {
  instructions: 'Answer in one sentence.',
  input: 'What does this service do?',
})
```

Choose a direct completion when no automatic tool loop, session memory, or agent-level policy is needed.

## Reusable agent factory

Create provider clients and stores once, then build agents from injected dependencies. Avoid reading global credentials inside tool definitions or hiding database construction inside an agent.

```ts
export function createSupportAgent(deps: SupportDependencies) {
  return new AgentBuilder('support', deps.model)
    .tool(createAccountTool(deps.accounts))
    .memory(deps.memory)
    .observe(deps.observer)
    .build()
}
```

## Authorization inside tools

A Zod schema validates the model's arguments. The tool must still derive or receive trusted caller context and authorize the operation before reading or mutating data. Treat model-provided user IDs and tenant IDs as untrusted input.

## Deterministic outer workflow

Use `PipelineBuilder` or ordinary application code to own branching, retries, queueing, and idempotency. Put an agent inside a stage when model reasoning is useful; do not ask a model to coordinate steps that the application can express deterministically.

## Adapter boundaries

Keep models, memory, vector search, and observers behind their interfaces. This makes local fakes and production adapters interchangeable without pretending providers or databases have identical capabilities.

## Separate development and operations

Register the same built agents in [Studio](/packages/studio) for local inspection. Attach [Lens](/packages/lens) or another observer for retained production telemetry. Neither product should own application authorization or business state.

Continue with [architecture](/packages/core/architecture) and the SDK's [agent stability guidance](/sdk/agents/stable-behavior).
