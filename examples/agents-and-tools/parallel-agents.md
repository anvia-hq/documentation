# Parallel agents

A pipeline can run independent specialists concurrently and then synthesize their outputs. Use this when every branch must run and no branch depends on another.

## Build the branches

```ts
import { Pipeline } from '@anvia/core/pipeline';
import { z } from 'zod';
const supportNotes = new Pipeline({
  id: 'support-notes',
  inputSchema: z.string(),
}).step({
  id: 'build-support-request',
  run: ({ input: incident }) => `Triage for support:\n${incident}`,
}).agent({
  id: 'ask-support-agent',
  agent: supportAgent,
  approval: 'reject',
  request: ({ input }) => ({ prompt: input }),
});
const engineeringNotes = new Pipeline({
  id: 'engineering-notes',
  inputSchema: z.string(),
}).step({
  id: 'build-engineering-request',
  run: ({ input: incident }) => `Triage for engineering:\n${incident}`,
}).agent({
  id: 'ask-engineering-agent',
  agent: engineeringAgent,
  approval: 'reject',
  request: ({ input }) => ({ prompt: input }),
});

```

## Merge and synthesize

```ts
const incidentBrief = new Pipeline({
  id: 'incident-brief',
  inputSchema: z.string(),
}).parallel({
  id: 'collect-specialist-notes',
  branches: {
    support: supportNotes,
    engineering: engineeringNotes,
  },
}).step({
  id: 'build-synthesis-request',
  run: ({ input: { support, engineering } }) => [
    'Synthesize these notes into one incident brief.',
    `Support:\n${support}`,
    `Engineering:\n${engineering}`,
  ].join('\n\n'),
}).agent({
  id: 'ask-synthesizer',
  agent: synthesizerAgent,
  approval: 'reject',
  request: ({ input }) => ({ prompt: input }),
});

const { output: brief } = await incidentBrief.run({
  input: incident,
});
console.log(brief);

```

Both branches receive the same validated input and execute concurrently. Their named outputs enter the merge step before the synthesizer runs. Unlike agent-as-tool delegation, the pipeline—not a model—decides that both specialists execute.

Parallel work multiplies rate pressure and cost. A rejected branch can fail the composed run, so define retry, timeout, and partial-result behavior explicitly. Do not send data to a branch that is not authorized to see it.

Continue with [parallel pipelines](/sdk/advanced/parallel-and-batch/parallel) and [failure behavior](/sdk/advanced/parallel-and-batch/failures).
