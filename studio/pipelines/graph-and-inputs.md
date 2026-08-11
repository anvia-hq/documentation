# Graph and inputs

The pipeline graph answers two questions before you run anything: what stages exist, and how does data move between them? The Input tab then lets you exercise that graph with any JSON-compatible value accepted by the pipeline.

## Read the graph

Studio renders the value returned by `pipeline.graph()`. The graph describes workflow structure, not the values produced during a run.

```text
Input → Normalize ticket → Analyze ticket → Build decision → Output
                               ├─ classification
                               ├─ priority
                               └─ routing
```

A graph can contain these node kinds:

| Kind | Meaning |
| --- | --- |
| `input` | Entry point for the value submitted to the pipeline. |
| `step` | A synchronous or asynchronous TypeScript transform. |
| `pipeline` | A composed pipeline operation. |
| `parallel` | The parent stage that starts named branches together. |
| `branch` | One named operation inside a parallel stage. |
| `agent` | A prompt sent through an Anvia agent. |
| `extractor` | Model output parsed into a schema-defined value. |
| `output` | The final value returned by the workflow. |

Edges show execution order. Parallel branch edges can also carry labels, and branch nodes expose their branch key.

The graph is generated from the current in-process pipeline definition. Restart Studio after changing the pipeline so the browser loads the new structure.

## Make nodes useful to operators

Add stage metadata when constructing the pipeline:

```ts
const pipeline = new PipelineBuilder(z.string(), {
  id: 'ticket-triage',
  name: 'Ticket triage',
  description: 'Routes incoming support tickets.',
  metadata: { owner: 'support-operations' },
})
  .step((text) => text.trim(), {
    id: 'normalize-ticket',
    name: 'Normalize ticket',
    description: 'Remove surrounding whitespace before classification.',
    metadata: { dataClass: 'support-ticket' },
  })
  .build()
```

Select a node in Studio and open **Metadata**. The inspector can show:

- its stable ID, label, kind, and description;
- custom metadata added by the pipeline builder;
- an agent ID for an agent stage;
- a nested pipeline ID for a composed pipeline;
- a branch key for a parallel branch;
- the active run status when that stage has started, completed, or failed.

The summary above the selected node reports total nodes and edges, agent and extractor counts, and whether the graph contains a parallel stage. The node total includes the synthetic input and output nodes; the pipeline's stage count does not.

## Enter input as JSON

Studio's Input editor accepts a JSON value. This includes strings, numbers, booleans, `null`, arrays, and objects.

For a `z.string()` pipeline, include the JSON quotes:

```json
"ORDER 11001"
```

Entering `ORDER 11001` without quotes is not valid JSON, so Studio stops before sending a run request.

For a typed object pipeline:

```ts
const pipeline = new PipelineBuilder(
  z.object({
    ticket: z.string(),
    accountId: z.string(),
    urgent: z.boolean().default(false),
  }),
  {
    id: 'account-ticket-triage',
    name: 'Account ticket triage',
  },
)
  .step(({ ticket, accountId, urgent }) => ({
    accountId,
    ticket: ticket.trim(),
    priority: urgent ? 'high' : 'normal',
  }))
  .build()
```

Enter the matching object:

```json
{
  "ticket": "Checkout is unavailable",
  "accountId": "acct_42",
  "urgent": true
}
```

There are two separate validation boundaries:

1. Studio parses the editor text as JSON. Invalid JSON never starts a run.
2. The pipeline validates the parsed value with its input schema. A valid JSON value of the wrong shape starts a run that ends in an error.

Studio submits the parsed value without converting an object into text or a string into an object. Keep the editor value aligned with the schema passed to `PipelineBuilder`.

## Watch stage state

During a Studio run, stage lifecycle logs drive the status shown on graph nodes:

| Status | Meaning |
| --- | --- |
| `running` | Studio received the stage's `stage_started` event. |
| `completed` | The stage returned and reported its duration. |
| `failed` | The stage threw or rejected and reported an error. |

Statuses belong to the active run and are not a permanent overlay of an older run. Input validation happens before a named stage, so a schema failure produces a failed run without marking one of the workflow stages as failed.

Continue with [Runs, logs, and replay](/studio/pipelines/runs-logs-and-replay) to inspect the evidence created by each execution.
