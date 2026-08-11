# Traces

A trace is one end-to-end application operation. It connects the request-level summary to the generations, tool calls, retrievals, evaluators, and application spans that produced the result.

Use traces when an overview tells you **what changed** and you need to find **where it changed**.

## Investigation workflow

1. Open **Observability → Traces** and choose the time range that contains the event.
2. Search or filter until the table represents the affected traffic.
3. Sort by duration, tokens, cost, or start time to surface useful examples.
4. Open a trace and use its span tree or timeline to isolate the responsible operation.
5. Record a human review when the output is clearly acceptable or unacceptable.
6. Promote a failed review into a managed dataset draft when it should become a regression case.

The trace explorer keeps its search, filters, sort, columns, and page in the URL. Share or bookmark that URL when another workspace member needs to examine the same population.

## Choose the next view

| Goal | Open |
| --- | --- |
| Find traces by runtime or business context | [Trace explorer](/lens/observability/traces/explorer) |
| Inspect spans, timing, payloads, and errors | [Trace details](/lens/observability/traces/details) |
| Visually compare two to four individual traces | [Compare traces](/lens/observability/traces/compare) |
| Label an outcome and retain a failed example | [Trace reviews](/lens/observability/traces/reviews) |

Trace comparison is for individual production operations. To compare evaluation suites across releases, use [Compare releases](/lens/evaluations/compare).

## What Lens can show

Timing, status, identifiers, and span relationships come from trace telemetry. Model, service, environment, release, token, cost, input, and output fields appear only when the instrumentation supplies them.

A missing prompt body does not mean the trace is broken. Safe capture, redaction, an upstream exporter, or retention policy can intentionally omit payload content while preserving operational metadata. Review [Capture and privacy](/lens/connect/anvia/capture-and-privacy) before enabling fuller capture.

