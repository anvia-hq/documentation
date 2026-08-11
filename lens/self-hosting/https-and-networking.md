# HTTPS and networking

Publish one Lens origin over HTTPS and keep every backend service private. Browsers, native Anvia instrumentation, and supported Langfuse instrumentation all connect through that same web origin.

## Intended boundary

```text
Internet :443
    │
    ▼
reverse proxy or load balancer
    │
    ▼
Lens web 127.0.0.1:8080
    │ private Compose network
    └──► API :3001 ──► PostgreSQL / ClickHouse / Redis / worker
```

The production Compose file publishes only `web`. Do not add host port mappings for `api`, `postgres`, `clickhouse`, `redis`, `worker`, or `migrate`.

## Bind Lens behind the proxy

Set the exact public HTTPS origin and bind the web container to loopback so the host proxy is the only public listener:

```dotenv
PUBLIC_APP_URL=https://lens.example.com
WEB_ORIGIN=https://lens.example.com
WEB_PORT=127.0.0.1:8080
```

Apply the change:

```sh
docker compose up -d
docker compose ps
```

The public origin must not end in `/api`, and the two origin values should not use internal Compose hostnames.

## Nginx example

An Nginx instance installed on the Docker host can terminate TLS and proxy all Lens paths to the private web binding:

```nginx
server {
    listen 80;
    server_name lens.example.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Validate and reload Nginx, then request the certificate:

```sh
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d lens.example.com
```

The host Nginx listens on public ports 80 and 443. It connects to Lens on `127.0.0.1:8080`; it does not need to listen on 8080 itself.

Equivalent reverse proxies and managed load balancers are supported when they preserve the host, client forwarding chain, and original scheme.

## Request size limits

OTLP requests cross up to three size limits:

1. the external reverse proxy or load balancer;
2. the Lens web image's Nginx limit, currently `10m`;
3. `OTLP_MAX_BODY_BYTES` in the API, defaulting to 10 MiB.

The smallest limit wins. Prefer configuring exporters to send smaller batches. A custom value above 10 MiB also requires a custom web proxy configuration or image; changing only the API variable is insufficient.

## Health and metrics exposure

The web service forwards `/health/live` and `/health/ready`, making them suitable for an external load balancer:

```sh
curl -fsS https://lens.example.com/health/live
curl -fsS https://lens.example.com/health/ready
```

`/internal/metrics` exists on the private API and is intentionally not forwarded by the bundled web proxy. Attach a metrics collector through a private deployment path rather than exposing API port 3001 publicly.

## Firewall checklist

- Allow inbound 443 to the reverse proxy; allow 80 only when needed for redirect or certificate issuance.
- Bind `WEB_PORT` to loopback or a private interface when a host proxy fronts Lens.
- Deny public access to PostgreSQL 5432, Redis 6379, ClickHouse 8123 and 9000, and API 3001.
- Restrict host SSH and Docker access to Lens operators.
- Protect outbound SMTP credentials and allow only the destinations the installation needs.
- Keep instrumentation keys in server-side environments, never browser bundles.

## Common proxy symptoms

| Symptom | Likely cause |
| --- | --- |
| Sign-in redirects to HTTP or another host | Incorrect `PUBLIC_APP_URL` or missing forwarded scheme/host. |
| Browser API calls fail while the page loads | `WEB_ORIGIN` does not exactly match the public origin. |
| Telemetry receives `413` | Export batch exceeds an external proxy, Lens web, or API body limit. |
| Proxy returns `502` | Lens web is unreachable or its API dependency is unavailable. |
| Certificate succeeds but telemetry cannot connect | Application base URL, DNS trust, or CA trust differs from the browser path. |

Use [Troubleshooting](/lens/self-hosting/troubleshooting) to follow a failure through the dependency chain.
