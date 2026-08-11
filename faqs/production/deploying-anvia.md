# How should I deploy Anvia?

Deploy Anvia as part of the TypeScript application that owns the agent. The SDK does not require a proprietary hosting platform.

## Short requests

Run direct completions and bounded agents in an authenticated server route when the hosting runtime permits the required duration and streams responses without buffering. Verify provider, platform, and proxy time limits with a real request.

## Long-running work

Move pipelines, batches, and slow agent runs into a worker when they can outlive an HTTP request. BullMQ, Trigger.dev, a cloud queue, or another job system can own admission, retry, scheduling, and recovery while calling the same Anvia function.

```text
HTTP route → validate and enqueue → worker runs Anvia → persist result/events
```

Anvia does not require one queue implementation. Keep the job payload small, stable, and authorized again when the worker starts.

## Deployment checklist

- Pin package and model configuration.
- Bound agent turns, model output tokens, tool concurrency, and batch concurrency; enforce wall-clock timeouts at the provider, tool, worker, and hosting boundaries that own them.
- Use shared persistence when several instances must see the same session or stream.
- Flush or shut down the configured telemetry integration during graceful shutdown.
- Keep Studio on a trusted development interface.
- Provide health checks for the application and its dependencies.

See [production workers](/sdk/pipelines/production-workers), [compatibility and versioning](/packages/compatibility-and-versioning), and [Lens self-hosting](/lens/self-hosting).
