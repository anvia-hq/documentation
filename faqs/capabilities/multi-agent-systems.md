# When should I build a multi-agent system?

Use multiple agents when a child creates a real boundary: different instructions, tools, model, knowledge, permission scope, output contract, or independent testing. Keep one agent when the work shares the same role and policy.

## What are the common coordination shapes?

| Need | Shape |
| --- | --- |
| A coordinator should decide whether to delegate | [Agent as a tool](/sdk/advanced/multi-agent/agent-as-tool) |
| The same specialists must run in a known order | [Pipeline](/sdk/pipelines) |
| Independent specialists can run together | Pipeline parallel branches or application orchestration |

The model should choose a child only when adaptive routing is useful. If every request must call the same agents, deterministic composition is easier to test and operate.

## What does another agent cost?

Each child adds at least another prompt and model-call path, plus context, usage, latency, tracing, and failure handling. Delegation can also expose data or tools across a boundary if the child is built too broadly.

## Does a coordinator enforce child permissions?

No. Build each child with only its allowed tools and context. Authorization belongs in application services and tool handlers, not coordinator instructions. Decide explicitly how memory and child events are scoped and exposed.

## How should I decide?

Start with [When not to use multiple agents](/sdk/advanced/multi-agent/when-not-to-use), then review [Coordination](/sdk/advanced/multi-agent/coordination) and [Failures](/sdk/advanced/multi-agent/failures). Measure whether the specialist improves results enough to justify its operational cost.
