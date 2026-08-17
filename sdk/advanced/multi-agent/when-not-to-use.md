# When not to use multiple agents

Keep one agent when a task is one workflow with the same instructions, tools, model, knowledge, and policy.

## 1. Count the real cost

Every child adds another prompt, model call, context window, turn budget, trace, latency source, and failure path. Those costs are useful only when the child creates a meaningful boundary.

Use a direct completion for one model request with application-owned control flow.

Use one agent for one role and one tool or policy set.

Use an ordinary tool for one deterministic reusable action.

Use a pipeline for a known sequence of typed steps.

Use multi-agent coordination when model judgment should choose among distinct specialists.

## 2. Add a child for a boundary

A child is justified when its role, instructions, allowed tools, model, knowledge scope, permission scope, output expectation, or independent evaluation differs.

If none of those differ, keep the work in the coordinator.

## 3. Prefer deterministic composition

If every request must call the same specialists in the same order, call them from application code or a [Pipeline](/sdk/pipelines), then pass their outputs to one synthesis step.

A coordinator adds value when the model must decide whether, when, or which specialist to invoke.

## 4. Compare against the simpler system

Measure task quality, latency, usage, failure rate, and operator clarity against a single-agent baseline.

Remove a child when it repeats the parent's work, receives nearly the full parent context, rarely changes the result, or adds more failures than useful isolation.

Finish with the [production checklist](/sdk/advanced/multi-agent/production-checklist).
