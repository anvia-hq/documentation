# Evaluations

Evaluations turn important agent behavior into repeatable evidence. A case runs one input against a target, metrics judge the output, and Lens connects each result to the trace that produced it.

Use evaluations to answer a different question from observability:

| Workflow | Question |
| --- | --- |
| Observability | What happened during this request? |
| Evaluation | Does this behavior meet an explicit expectation? |

A healthy trace only means the request ran without a runtime error. It does not prove the answer was correct, grounded, safe, or useful.

## The evaluation model

```text
Suite run
├── Case: refund-window
│   ├── Target output
│   ├── Metric: policy-fact-present → pass
│   └── Related trace
├── Case: billing-owner
│   ├── Target output
│   ├── Metric: policy-fact-present → fail
│   └── Related trace
└── Run summary
    ├── Completed
    ├── 50% pass rate
    └── 100% trace coverage
```

The objects serve different purposes:

| Object | Responsibility |
| --- | --- |
| Suite | Names the capability being tested, such as `support-policy-regression`. |
| Run | Records one execution of the suite. |
| Case | Supplies one stable input and its expected behavior. |
| Target | Runs the agent, function, or workflow being tested. |
| Metric | Converts the target output into `pass`, `fail`, or `invalid`. |
| Result | Stores one metric outcome for one case. |
| Trace | Explains the model and tool activity behind the target output. |

One case can produce several results because a suite can apply several metrics to the same output.

## A practical workflow

Start with one behavior that matters and keep the first suite small:

1. Describe a concrete failure, such as “the answer states the wrong refund window.”
2. Add normal, boundary, and previously failing cases.
3. Use the simplest evaluator that reliably detects the failure.
4. Run the suite with the Lens reporter attached.
5. Open the run, inspect failures, and follow their traces.
6. Keep useful cases stable so later releases can be measured against the same contract.

Do not begin by collecting every available score. A small suite with an understandable failure condition is more useful than a large suite nobody trusts.

## Choose where to start

| Goal | Page |
| --- | --- |
| Turn risks into cases and metrics | [What to evaluate](/lens/evaluations/what-to-evaluate) |
| Connect `runEvalSuite()` to Lens | [Run evaluations](/lens/evaluations/run-evaluations) |
| Monitor and inspect suite executions | [Evaluation runs](/lens/evaluations/runs) |
| Search metric outcomes across runs | [Results](/lens/evaluations/results) |
| Curate reusable, versioned cases | [Datasets](/lens/evaluations/datasets) |
| Measure a candidate against a baseline | [Compare releases](/lens/evaluations/compare) |
| Turn evaluation requirements into a release decision | [Quality gates](/lens/evaluations/quality-gates) |

## Run status is not quality status

Lens keeps infrastructure state separate from quality outcomes:

- **Running** means the suite started and has not reported a terminal event.
- **Completed** means the suite finished processing its cases.
- **Failed** means the suite itself could not finish.

A completed run may contain failed results. That is the expected representation of a suite that executed correctly and found a product-quality regression.

## What Lens receives

The `@anvia/lens` reporter sends run lifecycle events and individual evaluation results. Results can include:

- suite, run, case, and metric identifiers;
- pass, fail, or invalid outcome;
- numeric or categorical score values;
- evaluator explanation;
- environment, service, and release context;
- a related trace and observation;
- optional case payloads and metadata.

Payload capture is disabled by default for the Lens evaluation reporter. This keeps the result useful without automatically exporting case inputs, expected values, context, retrieval context, and outputs. Enable payloads only when the project is approved to retain them.

## Naming for repeatable evidence

Keep suite names, case IDs, and metric names stable once they are used as a baseline. These identifiers are how humans—and release-comparison workflows—recognize equivalent evidence across runs.

Change an identifier when its meaning changes. If `grounded-answer` is given a fundamentally different rubric, use a new metric name rather than silently changing the contract behind historical results.

Continue with [What to evaluate](/lens/evaluations/what-to-evaluate) to design a useful first suite, then [Run evaluations](/lens/evaluations/run-evaluations) to report it to Lens.
