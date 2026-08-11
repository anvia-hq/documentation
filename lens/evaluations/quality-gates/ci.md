# CI enforcement

Lens exposes a project-authenticated endpoint so a CI job can apply the same quality gate used in the web comparison.

The check needs three stable identifiers:

- The quality gate ID.
- A completed candidate run ID.
- A completed baseline run ID.

Create both runs before the gate step and keep their IDs as job outputs or artifacts. Do not select “the latest run” implicitly in release automation.

## Call the gate endpoint

Store the Lens URL and project ingestion credentials as CI secrets, then run:

```sh
curl --fail-with-body --silent --show-error \
  --user "$ANVIA_LENS_PUBLIC_KEY:$ANVIA_LENS_SECRET_KEY" \
  --header 'Content-Type: application/json' \
  --data "{\"candidateRunId\":\"$CANDIDATE_RUN_ID\",\"baselineRunId\":\"$BASELINE_RUN_ID\"}" \
  "$ANVIA_LENS_BASE_URL/api/public/quality-gates/$QUALITY_GATE_ID/evaluate" \
  | tee quality-gate.json \
  | jq --exit-status '.verdict == "pass"'
```

The endpoint returns HTTP `200` for all valid verdicts, including `fail` and `insufficient_data`. `jq --exit-status` is what makes the shell step fail unless the verdict is exactly `pass`.

## Read the response

A successful request returns the gate definition, both run IDs, the overall verdict, and one result for the minimum case count plus every configured rule:

```json
{
  "candidateRunId": "candidate-run-id",
  "baselineRunId": "baseline-run-id",
  "verdict": "pass",
  "rules": [
    {
      "verdict": "pass",
      "message": "Candidate has 52 cases",
      "candidateValue": 52,
      "baselineValue": null
    }
  ]
}
```

Keep `quality-gate.json` as a CI artifact. It explains which rule blocked a release without requiring a reviewer to reconstruct the original shell output.

## GitHub Actions example

```yaml
- name: Enforce Lens quality gate
  env:
    ANVIA_LENS_BASE_URL: ${{ secrets.ANVIA_LENS_BASE_URL }}
    ANVIA_LENS_PUBLIC_KEY: ${{ secrets.ANVIA_LENS_PUBLIC_KEY }}
    ANVIA_LENS_SECRET_KEY: ${{ secrets.ANVIA_LENS_SECRET_KEY }}
    QUALITY_GATE_ID: ${{ vars.LENS_QUALITY_GATE_ID }}
    CANDIDATE_RUN_ID: ${{ steps.candidate.outputs.run_id }}
    BASELINE_RUN_ID: ${{ vars.LENS_BASELINE_RUN_ID }}
  run: |
    curl --fail-with-body --silent --show-error \
      --user "$ANVIA_LENS_PUBLIC_KEY:$ANVIA_LENS_SECRET_KEY" \
      --header 'Content-Type: application/json' \
      --data "{\"candidateRunId\":\"$CANDIDATE_RUN_ID\",\"baselineRunId\":\"$BASELINE_RUN_ID\"}" \
      "$ANVIA_LENS_BASE_URL/api/public/quality-gates/$QUALITY_GATE_ID/evaluate" \
      | tee quality-gate.json \
      | jq --exit-status '.verdict == "pass"'

- name: Upload gate evidence
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: lens-quality-gate
    path: quality-gate.json
```

## Diagnose rejected checks

| Response | Meaning |
| --- | --- |
| `401` | The project key is missing, invalid, revoked, or belongs to an inactive project. |
| `404` | The gate or either run does not exist in that project. |
| `400 incomplete_runs` | Candidate or baseline is not completed. |
| `400 incompatible_runs` | The runs do not share a suite and environment. |
| `400 incompatible_gate` | The gate scope does not match the candidate's suite and environment. |
| `200 fail` | Evidence was sufficient and at least one rule failed. |
| `200 insufficient_data` | A required case, metric, score, or trace value was unavailable. |

The endpoint uses HTTP Basic authentication with the project public key as username and secret key as password. Never expose the secret in browser code, command output, or a pull-request workflow that can be modified by untrusted contributors.

Each public check also records project-key usage and can drive a failed-quality-gate alert. See [Quality gates](/lens/evaluations/quality-gates) for verdict semantics.

