# Instructions

Instructions define how an agent should behave. Use them for durable policy, role, tone, and workflow rules that apply to every run.

## Add stable instructions

```ts
const agent = new Agent({
  id: 'support',
  model: model,
  instructions: [
    'Answer from verified support information.',
    'Use tools before making account-specific claims.',
    'Escalate billing, legal, or security uncertainty.',
  ].join('\n'),
})
```

Good instructions describe repeatable behavior. They should not contain the current user's permissions, tenant ID, database IDs, or other request-specific facts.

## Compose instruction blocks

Combine instruction blocks explicitly in the order they should be applied.

```ts
const agent = new Agent({
  id: 'research',
  model: model,
  instructions: [baseAgentRules, researchWorkflowRules].join('\n\n'),
  skills: researchSkills,
})
```

Anvia combines normal instruction blocks first, followed by skill instructions. Keep the order intentional and remove contradictory rules.

## Choose the right boundary

| Information | Put it in |
| --- | --- |
| Durable behavior and policy | Instructions |
| Facts the model should use | [Context](/sdk/agents/context) |
| User or tenant identity | Session and runner state |
| Product permissions | Tool handlers and services |
| Trace correlation | `.withTrace(...)` |

If one request needs fundamentally different behavior, create a different agent or scoped factory instead of appending conflicting instructions at runtime.

## Keep enforcement in code

Instructions can tell a model when to use a tool, but they cannot enforce safety. Every side-effect tool must still validate the user, tenant, input, permissions, and approval state.
