# Versioned prompts

`@anvia/lens` can retrieve versioned prompts from a Lens workspace, compile them with variables, and attribute agent runs to the exact prompt version they used.

Availability: the prompt SDK is merged on anvia@main but not yet released — `@anvia/lens` 1.1.3 does not include it. Verify your installed version.

## Fetch a prompt

Create a prompt client from the shared `LensClient`. Runtime credentials retrieve prompts but cannot mutate them; committing a version in Lens does not deploy it — move a label to deploy or roll back.

```ts
const prompts = lens.promptClient({ cacheTtlMs: 60_000, timeoutMs: 5_000 })
const prompt = await prompts.getPrompt({ name: 'support/answer' })
```

Omitting the selector resolves `production`, never the newest version. Specify a label **or** a positive integer version, not both:

```ts
const pinned = await prompts.getPrompt({ name: 'support/answer', version: 2 })
const staging = await prompts.getPrompt({ name: 'support/answer', label: 'staging' })
```

## Compile with variables

Resolved snapshots are deeply immutable and expose `ref`, `config`, `labels`, `selector`, and `variables`. Compilation is synchronous: `{{question}}` substitutes a named string, `\{{question}}` produces a literal placeholder, and missing or non-string values throw `LensPromptCompilationError`. Extra variables are ignored and substitutions are not recursive.

```ts
if (prompt.type === 'text') {
  const result = await agent.generate({
    prompt: prompt.compile({ question: 'How do refunds work?' }),
    trace: { promptRef: prompt.ref },
  })
}
```

Chat prompts compile to a fresh array of registry messages with roles and names preserved.

## Cache behavior

Each prompt client owns a bounded cache (default TTL 60 seconds, including pinned versions). Expired entries refresh before returning, without stale fallback, and identical concurrent requests share one retrieval.

- `cache: 'reload'` fetches and replaces a snapshot.
- `cache: 'no-store'` bypasses cache reads and writes.
- `prompts.clearCache()` invalidates cached snapshots.

Retrieval accepts an optional `signal`; one caller aborting does not cancel other callers sharing the retrieval. Failed responses are not cached. `LensPromptError` exposes `code` and, for HTTP errors, `status`.

## Attribute runs to a prompt

Fetching or compiling never sets a global current prompt. Pass identity explicitly:

- `trace: { promptRef: prompt.ref }` on `generate()`, `stream()`, or a pipeline root.
- `run: { promptRef: prompt.ref }` on `runEvalSuite` for evaluation identity.

The ref is `{ name, version }` — use the resolved numeric version, not the requested label. Pipeline attribution does not stamp unrelated child agents. For runs that change prompts between turns, completion-request middleware is the explicit override boundary: returning `promptRef` overrides that generation, returning `null` clears it, and omitting it preserves the run default.

Safe capture retains prompt identity without newly capturing template bodies or compilation variables; see [Capture and privacy](/lens/connect/anvia/capture-and-privacy).
