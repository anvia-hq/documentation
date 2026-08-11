# Compare traces

Trace comparison places two to four individual traces in one grid. Use it for visual, request-level analysis when similar operations produced different status, latency, token use, cost, or span structure.

## Start a comparison

1. Open the [Trace explorer](/lens/observability/traces/explorer).
2. Select at least two rows. You can select up to four.
3. Choose **Compare**.

Each tile loads the complete trace independently. Its header shows status, start time, trace ID, duration, span count, token usage, and cost. Use **Open trace** when one tile needs the larger detail workspace.

## Compare structure and timing

Each tile has its own span tree, timeline, search, collapsed branches, and selected span. This lets you align equivalent operations without forcing traces into the same structure.

For a latency regression:

1. Compare trace-level duration first.
2. Switch both tiles to the timeline.
3. Select the corresponding generation or tool span in each trace.
4. Compare span duration, status, model or service, and captured payloads.

For a behavioral difference, compare the branch shape and the selected spans' input, output, metadata, and errors. A missing branch can be more informative than a small duration delta.

## Know the boundary

The page does not compute a winner, statistical significance, or an aggregate regression. It is a synchronized workspace for inspecting a small number of real operations.

Use [Compare releases](/lens/evaluations/compare) when you need case-level and metric-level comparison across evaluation runs. Use [Trace reviews](/lens/observability/traces/reviews) to record a human decision on an individual result.

