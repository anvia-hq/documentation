# Dynamic tools checklist

Verify retrieval quality, catalog freshness, and execution safety before shipping a dynamic tool catalog.

## Catalog

- Give every tool a stable, distinct name.
- Write specific descriptions and narrow input schemas.
- Keep embedding text accurate and free of unrelated keywords.
- Store tenant, role, plan, and risk metadata where required.
- Rebuild the index when definitions, metadata, or tools change.
- Avoid rebuilding a stable catalog for every turn.

## Selection

- Tune `topK` and threshold with real prompts.
- Test common wording and domain synonyms.
- Test ambiguous and irrelevant prompts.
- Verify sensitive tools are filtered out when unavailable.
- Check intentional static/dynamic name collisions.
- Record selected tool names for internal diagnosis.

## Execution

- Enforce authorization inside every handler.
- Re-check tenant and product state immediately before side effects.
- Keep approvals on high-risk tools.
- Make writes idempotent or auditable.
- Map tool failures into safe product errors.
- Keep request-scoped tool instances out of shared mutable catalogs.

## Test the boundary

| Scenario | Expected result |
| --- | --- |
| Billing question | Relevant billing tools rank highest. |
| Unrelated question | No weak tool passes the threshold. |
| User lacks permission | Sensitive definition is filtered out. |
| Filter is accidentally broad | Handler still rejects the action. |
| Static and dynamic names collide | Static tool remains active. |
| Tool definition changes | Rebuilt index reflects the new contract. |
| Tool result changes the next task | Next turn retrieves the new relevant tools. |

Compare dynamic selection with the static baseline. The catalog should reduce model-facing tool noise without lowering task success or weakening authorization.
