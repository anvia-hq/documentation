# Dynamic tools checklist

Verify relevance, catalog freshness, and execution safety before shipping.

## Catalog

- Give every tool a stable, distinct name.
- Reject accidental duplicate names before indexing.
- Write specific descriptions and narrow input schemas.
- Keep embedding text accurate and free of unrelated keywords.
- Store eligibility metadata from trusted application state.
- Rebuild the index when definitions, metadata, embedding text, or tools change.
- Build stable in-memory catalogs during startup, not on every turn.

## Selection

- Pass each `ToolIndex` directly in `Agent.tools`.
- Tune `topK` and minScore with real prompts.
- Test common wording and domain synonyms.
- Test ambiguous, empty, and irrelevant prompts.
- Verify restricted definitions never reach an ineligible model request.
- Check static and indexed name collisions intentionally.
- Check duplicate names across separate indexes fail during construction.
- Measure the combined visible-tool count across all indexes.

## Execution

- Enforce authorization inside every handler.
- Re-check tenant and product state immediately before side effects.
- Keep `requiresApproval` on high-risk tools.
- Make writes idempotent or auditable.
- Map failures into safe product errors.
- Keep request-scoped tool instances out of shared mutable catalogs.
- Protect `agent.callTool()` as a separate direct-execution boundary.

## Expected scenarios

- A billing request ranks the intended billing capability highest.
- An unrelated request leaves weak matches below the minScore.
- An ineligible operator never receives the sensitive definition.
- A mistakenly broad filter is still stopped by handler authorization.
- A static/indexed name collision keeps the static tool.
- A tool-result topic change retrieves the newly relevant tool on the next turn.
- A rebuilt catalog reflects updated descriptions, schemas, metadata, and implementations.

Compare the dynamic catalog with a static baseline. It should reduce model-facing tool noise without lowering task completion or weakening policy enforcement.
