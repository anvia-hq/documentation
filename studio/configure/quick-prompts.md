# Quick prompts

Quick prompts put representative, ready-to-run requests on an agent's empty Playground. They are useful for demos, regression checks, onboarding, and recurring development scenarios.

## Add prompts per agent

Pass a `quickPrompts` record as the second `Studio` argument. Each key is a registered agent ID and each value is an array of prompt strings:

```ts
import { Studio } from '@anvia/studio'

new Studio(
  [supportAgent, engineeringAgent, customerCommsAgent],
  {
    quickPrompts: {
      'support-triage': [
        'Summarize TICKET-1001 for the support lead.',
        'List the evidence still needed before escalating this ticket.',
      ],
      'engineering-triage': [
        'Use the webhook retry runbook to prepare diagnostics.',
      ],
      'customer-comms': [
        'Draft a customer update for a webhook retry incident.',
      ],
    },
  },
).start({ port: 4021 })
```

Open the Playground and select an agent. Its prompts appear above the composer when the current conversation has no messages. Selecting a card runs that prompt immediately.

Quick prompts are Studio configuration. They do not change the agent's instructions, static context, memory, or tool set.

## Match the registered ID

The record key must exactly match the ID exposed by Studio:

```ts
quickPrompts: {
  'support-triage': ['Summarize the newest high-priority ticket.'],
}
```

If two registered agents begin with the same ID, Studio suffixes the later one. Configure each final ID independently:

```ts
new Studio([primarySupportAgent, experimentalSupportAgent], {
  quickPrompts: {
    'support': ['Summarize TICKET-1001.'],
    'support-2': ['Compare two possible ticket classifications.'],
  },
})
```

An unmatched key is ignored because no registered agent requests those prompts. See [Register agents and pipelines](/studio/configure/register-agents-and-pipelines) for the complete ID rules.

## Write useful prompts

A good quick prompt is concrete enough to exercise a known behavior and understandable without extra setup.

| Goal | Example |
| --- | --- |
| Exercise a tool | `Look up order 11001 and recommend the next action.` |
| Test retrieval | `Answer the refund question using the support handbook.` |
| Trigger an approval | `Issue a refund for order 11001.` |
| Compare model behavior | `Explain this incident in three bullet points.` |
| Verify missing-data handling | `Investigate ticket TICKET-DOES-NOT-EXIST.` |

Prefer prompts that expose an observable behavior. A vague prompt such as `Help me` rarely tells a developer whether tools, context, model selection, or run controls are working correctly.

Do not place secrets or privileged customer data in quick prompts. They are returned by Studio's configuration endpoint and displayed in the browser.

## Use prompts as development scenarios

A small set of prompts can act as a lightweight manual checklist:

1. Add one normal scenario for the agent's primary job.
2. Add one scenario that exercises its most important tool or knowledge source.
3. Add one boundary case, such as missing data or an approval decision.
4. Run the prompts after changing instructions, tools, context, or models.
5. Inspect the transcript and trace instead of judging only the final answer.

Quick prompts are not automated evaluations and do not assert an expected result. Use them to reach an interesting state quickly, then use [Traces](/studio/traces) to understand the run.

## Agent inventory

The Agents view reports the number of quick prompts registered for each agent. If the count is zero or the expected cards do not appear:

- confirm that the `quickPrompts` key matches the final agent ID;
- make sure the selected agent is correct;
- start a new empty conversation, because prompt cards are hidden after messages exist;
- restart Studio after changing the server-side configuration.

Continue with [Model catalog](/studio/configure/model-catalog), or return to the [Playground](/studio/playground).
