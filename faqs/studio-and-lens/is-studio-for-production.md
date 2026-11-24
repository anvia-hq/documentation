# Is Anvia Studio for production?

No. Studio is a trusted local development console, not a production operations dashboard or an application administration interface.

A person who can reach Studio may be able to run agents, invoke tools directly, approve tool calls, run or replay pipelines, and read sessions, prompts, results, logs, and traces. Those actions use the credentials and authority of the Studio process.

Studio does not provide built-in authentication, authorization, or TLS. In particular:

- `ui.protectShell` does not authenticate a user or protect API routes.
- `ui: false` removes the browser shell but leaves runtime routes active.
- Routing and redirect options change presentation, not access control.
- Tool approvals do not authorize access to the Studio server.

Run it on `127.0.0.1` with non-production credentials, test data, and the least tool authority required. By default Studio rejects requests whose `Host` or `Origin` is not a loopback name, which blocks DNS rebinding and cross-origin pages. If temporary remote access is unavoidable, set an explicit `hostname` or list the trusted names in `allowedHosts`, and protect the entire origin with trusted network controls, TLS, and authentication. The host check is not authentication, and none of this turns Studio into a supported production console.

For durable production traces, sessions, evaluation history, team access, and operational investigation, use [Lens](/lens/) with an appropriately secured deployment. Read [Studio security boundaries](/studio/configure/security-boundaries), [lifecycle and cleanup](/studio/configure/lifecycle-and-cleanup), and [Lens self-hosting](/lens/self-hosting) before choosing where each product runs.
