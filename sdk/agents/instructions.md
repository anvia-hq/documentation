# Instructions

Instructions define durable model behavior shared by every run of an agent. Use them for role, tone, workflow rules, uncertainty handling, and guidance about when tools should be used.

## 1. Write repeatable rules

```ts
const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: [
    'Answer from verified support information.',
    'Use tools before making account-specific claims.',
    'Ask one focused question when required details are missing.',
    'Escalate billing, legal, or security uncertainty.',
  ].join('\n'),
})
```

Good instructions state observable behavior. They avoid current-user data and do not pretend that prompt text can enforce permissions.

## 2. Separate behavior from facts

Use the correct boundary for each kind of information:

- put durable policy, role, tone, and workflow rules in `instructions`;
- put small shared facts in static [context](/sdk/agents/context);
- use a context index for large or changing knowledge;
- capture user and tenant dependencies in scoped tools and services;
- use memory sessions for conversation history; and
- pass correlation metadata through run-level `trace` options.

For example, an instruction can say when to check an account, but the account ID and access decision should stay in trusted application code.

## 3. Compose instruction blocks explicitly

Keep reusable blocks small and combine them in a deliberate order:

```ts
const baseRules = [
  'Be concise and state uncertainty.',
  'Never invent tool results.',
].join('\n')

const incidentWorkflow = [
  'Confirm the affected service and time range.',
  'Use incident tools before proposing remediation.',
].join('\n')

const incidentAgent = new Agent({
  id: 'incident-response',
  model,
  instructions: [baseRules, incidentWorkflow].join('\n\n'),
})
```

Remove duplicated or contradictory rules. A shorter hierarchy with clear priorities is easier to evaluate than one long prompt assembled from unrelated fragments.

## 4. Understand skill instructions

When an agent receives a loaded `skills` set, Anvia joins the agent's normal instructions first and the skill instructions second, separated by a blank line. Skill tools are also registered with the agent.

```ts
const researchAgent = new Agent({
  id: 'research',
  model,
  instructions: 'Produce concise, source-aware research notes.',
  skills: researchSkills,
})
```

Review the resulting behavior as one combined instruction set. Avoid skill and agent rules that disagree about tool use, output format, or safety.

## 5. Use another agent for another behavior

Run options do not replace an agent's instructions. If one workflow needs fundamentally different policy or capabilities, create a separate agent or a scoped factory instead of mutating a shared agent or embedding conflicting instructions in the user input.

Tool handlers, middleware, and guardrails must enforce rules that cannot depend on model compliance.

Continue with [Context](/sdk/agents/context).
