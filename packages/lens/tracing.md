# Tracing

`lens.create()` owns isolated OpenTelemetry trace and log providers configured for the Lens ingestion endpoint. It does not register global providers and does not collect unrelated application telemetry.

```ts
const tracing = lens.create({
  baseUrl: process.env.ANVIA_LENS_BASE_URL,
  publicKey: process.env.ANVIA_LENS_PUBLIC_KEY,
  secretKey: process.env.ANVIA_LENS_SECRET_KEY,
  serviceName: 'support-api',
  environment: 'production',
  release: process.env.APP_RELEASE,
  captureMode: 'safe',
})
```

The observer produces a root run span plus generation, tool, child-agent, timing, usage, error, and run-event observations. Lens uses `serviceName`, `environment`, and `release` to filter and compare application behavior.

## Configuration precedence

Explicit options override environment variables. `environment` falls back to `NODE_ENV`, then `default`. The request timeout defaults to 30 seconds and each captured value is limited to 262,144 bytes unless configured otherwise.

Use `@anvia/otel` instead when the application must send Anvia traces through an existing vendor-neutral OpenTelemetry pipeline. Use `@anvia/lens` when isolated, native Lens ingestion and Lens evaluation features are desired.
