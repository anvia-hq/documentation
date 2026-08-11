# Trace reviews

A trace review records a shared human decision about one production result. Use **Pass** when the result is acceptable and **Fail** when it should be investigated or retained as a regression case.

## Record a review

Open a trace and choose **Review trace**. Select **Pass** or **Fail**, add an optional note, and save.

Every project member can review a trace. There is one shared review per trace: editing it replaces the previous outcome and note rather than adding another vote. The trace displays the current outcome, reviewer, and explanation, and the explorer's **Review** filter can find unreviewed, passing, or failing traces.

The saved decision also appears as a human-sourced evaluation result. Use the evaluation results explorer when you need to analyze these decisions alongside other evaluator output.

## Promote a failed trace

Owners and admins can turn a failed review into a case in an existing managed dataset draft:

1. Save the trace review as **Fail**.
2. Choose **Promote to dataset**.
3. Select a managed dataset that has an open draft.
4. Review or edit the case ID and input JSON.
5. Optionally keep or edit the expected JSON, then choose **Add case**.

Lens derives the candidate case from the trace's captured root input and output and retains trace and review context as metadata. Promotion is disabled when no usable root input was captured. If no dataset has an open draft, create a dataset or start the next draft version from [Managed datasets](/lens/evaluations/datasets/managed).

Adding the case changes only the draft. Review the case, then publish a new immutable dataset version before using it in a repeatable evaluation run.

## Write useful notes

State the observable failure and expected behavior, such as “failed to use the account-specific policy returned by the lookup tool.” Avoid copying secrets or unnecessary personal data into the note or dataset case. A review is retained project data, not a private annotation.
