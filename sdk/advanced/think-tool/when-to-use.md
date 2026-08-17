# When to use the think tool

Use think when a concise checkpoint can improve the next decision, not simply because a request is long.

## 1. Choose meaningful decision boundaries

Good candidates include:

- incident investigation that compares several observations before remediation
- research that must decide whether evidence is sufficient
- support diagnosis that reconciles account, billing, and ticket data
- multi-step operations that verify prerequisites before the next tool
- sensitive-action preparation that summarizes evidence before a separate approval flow

Think is most useful after the model receives new evidence and still has a meaningful choice.

## 2. Skip deterministic or simple work

Do not add a checkpoint to:

- a direct question that needs no tool
- one deterministic lookup
- straightforward extraction or transformation
- a sequence already encoded as a deterministic pipeline
- a policy decision that code must enforce

Forcing think on every request adds a tool call, another model turn, latency, cost, and transcript noise.

## 3. Separate it from provider reasoning

Provider reasoning is a model capability and may be represented differently by each provider. Think is an ordinary Anvia tool call with explicit text input and an echoed result.

Use think when the application benefits from a visible operational checkpoint in the tool loop. Do not add it merely to imitate a provider's native reasoning mode.

## 4. Separate it from safety controls

“Check the request before issuing a refund” may guide model behavior, but cannot authorize the refund. The protected tool must still validate identity, permission, amount, approval state, and idempotency.

Think supports judgment. It never replaces enforcement.

Next, write effective [instructions](/sdk/advanced/think-tool/instructions).
