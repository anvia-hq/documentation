# SDK coverage review

Maintain an explicit documentation decision for each non-internal public entrypoint. Import checks
only validate APIs present in examples; they cannot reveal an exported API that nobody documented.

## Source and inventory

`scripts/sdk-coverage.json` records 71 public entrypoints across 35 public SDK packages at reviewed
source revision `d54b24996a4d6816219618fc703975e38993df75`. Each entry links its owning guide and
reference, with an export-name count and SHA-256 snapshot. The checker resolves TypeScript exports
from source, including re-exports and types; private packages and `@anvia/core/internal/*` are
excluded. A new/removed entrypoint or changed exported name set requires editorial review.

The map is entrypoint-level coverage, not a claim that every exported type or behavior has a
complete explanation. Name hashes do not detect changed signatures, defaults, or implementation
behavior under the same names. Review those changes against the source, checked examples, and
runtime tests. Types and aliases can belong to an existing feature/reference without a separate
tutorial. The `features` entries tie selected APIs to complete examples and named offline tests;
`utilities` records reference coverage or a reason for excluding a dedicated tutorial.

## Run the checks

Keep an installed Anvia checkout beside the docs, or set `ANVIA_REPO` to its absolute path.

In that SDK checkout, run `pnpm --filter @anvia/core build` before the runtime checks. Provider
source imports Core through workspace exports that resolve to `dist/`; a clean checkout has no
generated Core files until this build runs. Both CI validation jobs perform this prerequisite.

Run the following commands from the documentation repository:

```sh
node scripts/check-sdk-coverage.mjs
node --test scripts/test-sdk-coverage.mjs
node scripts/typecheck-rc-snippets.mjs --source
node scripts/check-sdk-runtime.mjs
pnpm docs:build
```

The coverage checker audits static Anvia imports in TypeScript/JavaScript fences under `sdk/`,
`packages/`, `examples/`, `channels/`, `lens/`, `studio/`, and `faqs/`. SDK-owned packages must resolve
to public entrypoints and exported named/default bindings. Known Channels packages are reported as
out of scope because they need the sibling Channels implementation; unknown package names still
fail. This is not an independent Channels API audit.

The broader snippet checker scans repository Markdown and public LLM text files. Complete
`anvia-check` fences enable all TypeScript diagnostics; ordinary fragments receive selected API
shape diagnostics and may rely on application variables. Only complete marked examples establish
standalone type correctness. The SDK source directory is excluded even when CI nests its checkout inside the docs repository.
Other local untracked Markdown may affect scan counts. Neither checker
validates shell commands, dynamic imports, provider availability, or deployment health.

Runtime checks execute selected actual Markdown examples with fake providers and synthetic data.
They verify deterministic contracts, not production services. The coverage CI workflow checks out
the full reviewed SDK revision from the inventory and runs these gates. The existing deployment
workflow retains its own SDK pin and focused checks; align pins when updating that workflow rather
than assuming they are synchronized automatically.

## Review a changed SDK surface

1. Read the source diff and changed exports. Update the guide/reference or record a justified
   integration-only decision; do not refresh a failing snapshot just to silence the check.
2. Add complete examples for representative contracts and offline runtime cases for behavior that
   types cannot prove. Keep the feature's page, marker, symbols, and runtime-test name in the map.
3. Update the entrypoint's guide/reference links. Use one canonical page for aliases and re-exports.
4. On a clean SDK package working tree, explicitly refresh the reviewed revision and name hashes:

   ```sh
   node scripts/check-sdk-coverage.mjs --refresh
   ```

5. Inspect the inventory diff and run every check above. Commit the inventory with its explanatory
   documentation changes. CI reads this revision rather than following an unreviewed branch tip.

## Tested documentation added in this review

| Contract | Complete example | Offline checks |
| --- | --- | --- |
| Eval expectations | [Negative controls](/sdk/evaluations#assert-intentional-negative-cases) | Expected failures and unexpected invalid judgments. |
| Eval responders | [Approval/question target](/sdk/evaluations#respond-to-agent-interactions-in-evaluations) | Continuation responses and exhausted response limits. |
| Message metadata | [Custom message schema](/sdk/messages/roles#validate-application-metadata) | Invalid fields and non-JSON transforms. |
| Continuations | [Server handler](/sdk/agents/interactions#validate-stored-continuations-and-incoming-responses) | Matching, authorization, and duplicate claims. |
| Client transports | [Custom SSE consumer](/sdk/streaming/server-transport#consume-a-custom-event-stream) | JSONL/SSE, HTTP errors, invalid data, and cancellation. |
| Client errors | [Masking and normalization](/packages/client/protocol-and-state#public-error-boundaries) | Safe public mapping versus retained local details. |
| Custom models | [Typed controls](/sdk/providers/model-boundary#_7-declare-controls-in-a-custom-model) | Defaults, overrides, invalid controls, and missing context metadata. |
| Provider output | [Catch and retry boundary](/sdk/structured-output/validation-errors#_4-handle-invalid-provider-output) | Retry kinds and streaming progress; adapter/tool errors tested separately. |
| Memory keys | [Custom-store factory](/sdk/memory/custom-stores#_6-reuse-the-official-scope-key-helper) | Scope separation and consistent keys across operations. |
| Embedding helpers | [Distance reference](/packages/core/api-reference#embedding-distances) | Zero vectors and dimension mismatches. |
| Graph helpers | [Schema adapter reference](/packages/graph/api-reference#schema-adapter-helpers) | Invalid property values and reserved names. |

## Integration utility decisions

The [Core utility reference](/packages/core/api-reference#integration-utility-reference) covers
completion formatting/discriminators, local tool normalization, vector-context detection, eval
selectors/reporters, and named execution errors. Numerical distances use a compact checked example.
The [Graph reference](/packages/graph/api-reference#schema-adapter-helpers) explains its narrower
property contract. [Grok constants](/packages/grok/api-reference#named-model-constants) list the
source identifiers without claiming live availability.

Low-level guardrail runners and policy-composition helpers are intentionally integration-only: the
application guide teaches policies attached to Agents. `passesLuhn` is a checksum primitive and
gets a boundary note rather than a payment-validation tutorial. Each exclusion and exact public
import path is recorded in the inventory. These decisions do not make the APIs private.
