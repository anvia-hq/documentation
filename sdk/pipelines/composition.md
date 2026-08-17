# Composition

Use `.compose()` to run another pipeline. The nested pipeline's output becomes the input to the following stage.

## 1. Reuse another pipeline

```ts
import { Pipeline } from '@anvia/core/pipeline';
import { z } from 'zod';
const cleanText = new Pipeline({
  id: 'clean-text',
  inputSchema: z.string(),
}).step({
  id: 'trim-text',
  run: ({ input: text }) => text.trim(),
}).step({
  id: 'collapse-whitespace',
  run: ({ input: text }) => text.replace(/\s+/g, ' '),
});
const classifyNote = new Pipeline({
  id: 'classify-note',
  inputSchema: z.string(),
}).compose({
  id: 'clean-input',
  pipeline: cleanText,
}).step({
  id: 'classify-urgency',
  run: ({ input: text }) => ({
    text,
    urgent: text.toLowerCase().includes('outage'),
  }),
});

```

The nested pipeline validates its own input when `.compose()` runs it. Its ID and metadata are represented as a pipeline node in the parent graph.

## 2. Adapt a service with a nested pipeline

Wrap an existing typed service in a pipeline when you want to compose it:

```ts
const addRiskScore = new Pipeline({
  id: 'add-risk-score',
  inputSchema: TicketInput,
}).step({
  id: 'calculate-risk-score',
  async run({ input: ticket }) {
    const riskScore = await riskService.score(ticket);
    return { ...ticket, riskScore };
  },
});

const pipeline = new Pipeline({
  id: 'risk-triage',
  inputSchema: TicketInput,
}).compose({
  id: 'score-risk',
  name: 'Calculate risk score',
  pipeline: addRiskScore,
});

```

Use `.step()` directly when the service call is not reused as an independently meaningful pipeline.

## 3. Branch without mutation

Fluent calls are immutable:

```ts
const base = new Pipeline({
  id: 'normalize',
  inputSchema: z.string(),
}).step({
  id: 'trim-text',
  run: ({ input: text }) => text.trim(),
});
const uppercase = base.step({
  id: 'uppercase',
  run: ({ input: text }) => text.toUpperCase(),
});
const measured = base.step({
  id: 'measure',
  run: ({ input: text }) => ({ text, length: text.length }),
});

```

`base`, `uppercase`, and `measured` are separate pipelines. Adding a stage does not modify an earlier instance.

Extract a nested pipeline when the behavior has a meaningful contract or several callers. Keep one-off transforms as ordinary `.step()` calls.

Next, run [parallel branches and batches](/sdk/pipelines/parallel-and-batch).
