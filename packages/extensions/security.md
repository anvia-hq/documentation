# Security

`@anvia/extensions` sets safe defaults, but the tools still run with your process's privileges on your
host. This page lists what the package enforces and what remains your application's responsibility.

## Local execution: shell, files, and git

These toolkits act on the machine running the agent. They are for trusted operators and workspaces,
not for untrusted prompts or code. For untrusted input, run tools inside an isolated
[sandbox](/sdk/advanced/sandbox) instead.

**`shell`**

- `run_command` requires approval by default. A toolkit-level `requiresApproval: false` removes it,
  so set that only when another control replaces human review.
- `execFile` mode (the default) runs one executable with an argument array and no shell
  interpolation. `mode: 'shell'` passes the command to `/bin/sh -c`; when `allowedCommands` or
  `deniedCommands` is set, shell mode rejects metacharacters and quotes so the policy cannot be
  bypassed.
- Commands run inside `rootDir`, optionally in a subdirectory (`allowSubdirCwd`).
- Children receive a fixed set of environment variables (`PATH`, `HOME`, user, locale, temp, and
  Windows system variables), not your process environment, so API keys in `process.env` are not
  inherited. `inheritEnv: true` turns this off.
- On timeout the process group receives `SIGTERM`, then `SIGKILL` one second later. Output is capped
  by bytes and characters.
- A command allowlist limits which programs start, not what they do. Interpreters and package
  managers can run arbitrary code.

**`filesystem`**

- Every path is resolved against the canonical (`realpath`) root; paths and symlinks that resolve
  outside it are rejected.
- `delete_file` requires approval by default and refuses the root, symlinks, and directories.
  `write_file` and `edit_file` do not require approval; use `readOnly: true` or set
  `requiresApproval` when writes need review.

**`git`**

- Read-only by default. `readOnly: false` adds `git_stage` and `git_commit`.
- `git_commit` requires approval and runs `git commit -m` without `--no-verify`, so the repository's
  own hooks execute with your privileges.
- Refs beginning with `-` are rejected, pathspecs are literal, and the environment is limited with
  terminal prompts disabled.

## Network tools

`httpClient` and `webFetch` share one URL safety layer:

- Only `http:` and `https:` URLs are accepted.
- `localhost`, `*.localhost`, `*.local`, `*.internal`, private and loopback IP literals, and host
  names that **resolve** to private addresses are blocked unless you set `allowPrivateAddresses`.
- The checked addresses are pinned for the actual connection, which prevents DNS-rebinding between
  the check and the request.
- Redirects are followed manually and every hop is re-validated. Configured headers are dropped on
  cross-origin redirects, and an `https:` to `http:` downgrade carrying them is refused.
- Response bodies are capped by `maxBytes`, and one timeout covers the request and its redirects.

Passing a custom `fetch` (intended for tests) bypasses address pinning: the URL is still checked, but
the connection is made by your `fetch`. Do not supply one in production unless it enforces the same
checks.

`httpClient` fails closed: it needs `baseUrl` or `allowedHosts`. Keep authorization tokens in its
`headers` option, never in instructions or prompts, so the model cannot read or change them. The
model can still call any allowed method and path on those hosts, so scope the credential to what the
agent may do.

Web-search providers call fixed API endpoints with `redirect: 'error'` and capped responses. Search
results and fetched pages are untrusted content that can contain prompt-injection text.

## Runtime and data

- Network, file, shell, git, and `jsonlHook` modules are Node-only. See
  [Runtime support](/packages/extensions#runtime-support).
- Guardrail patterns are heuristics. They miss data in unexpected formats and can match harmless text;
  they do not replace authorization or data-handling rules.
- `withToolCache` keys on tool name and arguments only, so cached results are shared by everyone using
  the same wrapped instance.
- The default `todo` and `scratchpad` stores live in memory for the toolkit instance and are shared
  by every run that uses it. Create one per session or supply a scoped store.

## What your application owns

- **Authorization and tenancy:** which users may run which toolkits, against which roots, hosts, and
  repositories.
- **Approvals:** reviewing approval requests and deciding when `requiresApproval` may be relaxed.
- **Secrets:** search API keys and HTTP credentials come from your configuration; the package reads no
  environment variables for them.
- **Retention:** audit, usage, and cost reports, and `jsonlHook` files, may contain run IDs, tool
  names, errors, and, if enabled, tool inputs and outputs. Decide who can read them and how long they
  are kept.
- **Isolation:** run untrusted code and prompts in a [sandbox](/sdk/advanced/sandbox), not through
  `shell` or `filesystem` on the host.
