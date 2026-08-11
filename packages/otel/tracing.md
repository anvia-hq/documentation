# Tracing

The adapter maps an Anvia run to a root internal span, then creates child spans for model generations and tools.

| Runtime activity | Span |
| --- | --- |
| Agent run | Root internal span |
| Model turn | Client span named `model.turn.<turn>` |
| Tool execution | Internal span named `tool.<name>` |
| Child agent | Nested run, generation, and tool spans |
| Run event | Event on the root span |

The observer exposes the generated trace and observation identifiers to the runtime. If the run includes a trace identifier, the adapter attempts to create the root under that trace context.

## Use an explicit tracer

```ts
const tracing = otel.create({
  tracer: tracerProvider.getTracer('support-agent', '1.4.0'),
  serviceName: 'support-api',
})
```

Supplying a tracer makes ownership explicit and avoids relying on global registration. Without one, `tracerName` and `tracerVersion` select the global tracer.

Successful spans receive an OK status. Failures record the error and end the affected span. Tool stream events are also used to construct nested child-agent observations.
