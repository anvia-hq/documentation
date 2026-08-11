# Core concepts

Lens organizes runtime telemetry and evaluation evidence around a small set of related objects. The most important boundary is this: a trace explains one operation, while an evaluation asks whether behavior is good enough across defined cases.

## Workspace and projects

The **workspace** is the Lens installation. It owns members and organization-wide configuration.

A **project** isolates an application's telemetry, evaluations, managed datasets, ingestion credentials, and retention policy. Every ingestion key belongs to one project, and every telemetry query runs in a project context.

Use separate projects when applications must not share credentials, access, or retention. Use environments inside one project for the same application running in development, staging, and production.

## Traces and observations

A **trace** is one end-to-end application operation, such as answering a support request or processing one evaluation case.

An **observation** is one unit of work inside the trace. Observations retain parent-child relationships, timing, and type. Depending on the application, a trace can include:

- an agent run;
- one or more model generations;
- tool calls;
- nested agent or workflow work;
- ordinary OpenTelemetry spans.

The trace reports the overall outcome. Its observations show where latency, tokens, cost, or an error originated.

```text
Trace: answer support request
├── Agent: support-agent
│   ├── Generation: classify and plan
│   ├── Tool: get_ticket
│   └── Generation: write response
└── Final status, duration, usage, and cost
```

## Sessions and users

A **session** groups traces that belong to the same conversation or multi-step workflow. One session may contain many traces.

A **user** connects activity across sessions, making reliability, usage, and cost inspectable for one application identity. Lens uses the `sessionId` and `userId` supplied by instrumentation; it does not infer identity from prompt text.

Use stable application IDs that are safe for operational systems. Authorization and customer identity remain owned by the application.

## Trace context

Context makes telemetry filterable and comparable:

| Dimension | Meaning |
| --- | --- |
| Environment | Where the code ran, such as `staging` or `production`. |
| Release | The exact deployed build, such as a Git SHA or immutable version. |
| Tags | Searchable operational labels. |
| Metadata | Structured investigation details. |
| Service name | The application or process that emitted the telemetry. |

Environment and release are different. An environment changes over time; a release identifies the code that was present at a particular time.

## Evaluation runs and results

An **evaluation run** is one execution of a named suite against a set of cases. Each case supplies input to a target and can produce multiple metric results. If the target is instrumented, the result can link to the trace produced during that case.

Run status and result outcome answer different questions:

- `completed` means the suite finished processing its cases;
- a passing or failing result says whether one quality check met its expectation.

A run can therefore complete successfully while containing failed quality results. This is expected: infrastructure completion does not imply product quality.

## Datasets

Lens has two dataset lifecycles:

| Dataset | Purpose |
| --- | --- |
| Observed dataset | Reconstructs the cases that evaluation telemetry actually reported. |
| Managed dataset | Curates reusable cases inside Lens and publishes immutable versions. |

Managed drafts are editable. Published versions are immutable so the same named version produces a repeatable evaluation input. Observed data can be promoted into a managed workflow when its cases are complete and usable.

## Releases, comparisons, and gates

A **release comparison** places evaluation runs from different releases side by side. Use immutable release identifiers so the result maps back to deployable code.

A **quality gate** evaluates defined metric requirements against a candidate run. It is a release decision built from evaluation evidence—not a replacement for tests, code review, or deployment controls.

## Costs

Generation observations can carry provider-reported input, cached-input, and output costs. Lens can also apply organization-wide model pricing for exact model names. Cost belongs to model activity inside traces; it is then aggregated across traces, sessions, users, or time ranges.

## Capture and retention

Capture controls which payloads leave the application. Retention controls how long ingested telemetry remains in a project. They solve different problems.

Safe capture is the native Anvia default: it keeps operational trace structure while omitting prompt and response bodies. Full capture provides more investigation context but also expands the sensitive data stored in trace, session, and evaluation views.

Choose capture, access, and retention together. Lens telemetry does not replace product records, conversation memory, or a business audit log.

## How the objects connect

```text
Workspace
└── Project
    ├── Traces ── grouped by Sessions and Users
    │   └── Observations ── agent, generation, tool, span
    ├── Evaluation runs
    │   ├── Cases
    │   ├── Metric results
    │   └── Linked traces
    ├── Observed and managed datasets
    └── Release comparisons and quality gates
```

Continue with [Your first trace](/lens/your-first-trace) for the smallest runnable integration, or open [Observability](/lens/observability) to begin investigating project activity.
