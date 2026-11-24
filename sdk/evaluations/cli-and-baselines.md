# CLI and baselines

Two gates keep an evaluation honest as it grows: a command line that fails CI, and a stored baseline that tells you whether a case got worse.

## Run a suite from a command line

`runEvalCli` runs a suite, prints a report, and optionally raises the process exit code:

```ts
await runEvalCli({
  ...suite,
  argv: true,        // read process.argv.slice(2)
  exitCode: true,    // raise process.exitCode when the gate fails
  format: 'pretty',
})
```

Flags are read **only** when `argv` is enabled. `argv: true` reads `process.argv.slice(2)`; an array is used verbatim. Without it, real command-line flags are ignored and the suite simply runs.

Parsing throws rather than exiting: an unknown flag, a missing value, or a bad value rejects before the suite runs. There is no `--help` and no implicit `process.exit`.

| Flag | Field | Notes |
| --- | --- | --- |
| `--format <pretty\|json\|quiet>`, `-f` | `format` | Defaults to `pretty`; an unknown value throws. |
| `--case <ids>`, `--cases` | `caseIds` | Comma-separated; repeats append; **replaces** the suite's `caseIds`. |
| `--tag <tags>`, `--tags` | `tags` | Comma-separated; same replacement rule. |
| `--concurrency`, `-c` / `--target-concurrency` / `--metric-concurrency` | concurrency | Positive integers. |
| `--timeout`, `--case-timeout` | `caseTimeoutMs` | Per trial, not per case. |
| `--trials <n>` | `trials` | Shorthand for `{ count: n, minPassRate: 1 }`. |
| `--shard <i>/<n>` | `shard` | Zero-based index, `0 <= i < n`. |
| `--fail-fast` | `failFast` | No negation flag. |
| `--failed-only`, `--only-failures` | `onlyFailures` | Display filter only; it does not change what runs. |
| `--color` / `--no-color`, `--progress` / `--no-progress` | display | Last one wins. |
| `--baseline <path>` | `baselinePath` | See below. |
| `--save <path>` | `savePath` | See below. |
| `--score-tolerance <n>` | `scoreTolerance` | Finite and non-negative. |

A leading `-` starts a flag, so `--score-tolerance -0.1` reports a missing value rather than a range error. Inline `--flag=value` works, but boolean flags ignore the value: `--failed-only=false` still enables the filter. Bare positional tokens are ignored.

CLI values win over the options object, and an unset flag never overrides: `format` falls back to the option, and `caseIds` or `tags` keep the suite's own selection unless a flag is present.

`parseEvalCliArgs(argv)` is exported when you want the parsed object without running a suite.

## Streams and exit codes

The report goes to stdout. Progress lines, expectation mismatches, baseline notices, and comparison text go to stderr, which keeps `--format json` parseable on stdout. `output: { stdout, stderr }` overrides both writers, and `format: 'quiet'` writes nothing.

`evalExitCode(result)` returns `2` for a required invalid judgment, `1` for a required failure, and `0` otherwise. With expectations, a match returns `0`; an unexpected invalid returns `2`; any other mismatch returns `1`. A baseline regression only raises `0` to `1`.

With `exitCode: true` the runner raises `process.exitCode` when the computed code is higher than the current one. It never calls `process.exit` and never lowers an existing code, so a later failure in the same process still wins.

## Store and compare baselines

```ts
import {
  compareEvalResults, loadEvalResult, runEvalSuite, saveEvalResult,
} from '@anvia/core/evals'

const result = await runEvalSuite(suite)
await saveEvalResult('evals/baseline.json', result)

const baseline = await loadEvalResult('evals/baseline.json')
const comparison = compareEvalResults(baseline, result, { scoreTolerance: 0.02 })

comparison.hasRegressions // gate on this
comparison.regressions    // [{ caseId, metricName, required, baseline, candidate, ... }]
comparison.metricDeltas   // per-metric pass-rate and mean-score movement
```

`saveEvalResult(path, result, { redact, maxValueLength })` writes pretty JSON and creates parent directories. `loadEvalResult(path)` validates the snapshot structure, not the cases, so a truncated file can still load: compare a snapshot only when you also trust its provenance.

`compareEvalResults(baseline, candidate, options)` classifies each case and metric:

- An outcome moving down (`pass` → `fail` → `invalid`) is a regression, and moving up is an improvement, regardless of any tolerance.
- With **no** `scoreTolerance`, a same-outcome score change is `unchanged`; the delta still appears in `metricDeltas`. Set a tolerance when you want numeric drift to gate.
- `includeOptionalMetrics` defaults to `false`, so optional-metric regressions are reported but do not set `hasRegressions`.
- Removed cases and missing baseline metrics count as regressions unless `ignoreRemovedCases` or `ignoreMissingMetrics` is set. Added cases never do.
- `scoreTolerance` must be finite and non-negative.

Optional regressions are rendered with an `[optional]` tag, which is the difference between "noticed" and "blocks the merge".

`formatEvalComparison(comparison)` and `printEvalComparison(comparison)` render the comparison; the printed form lists regressions, improvements, added and removed cases, missing metrics, usage delta, optional cost delta, and duration delta.

`assertEvalPassed(result, expectations?)` throws `EvalAssertionError` with one message per failing required metric, or per expectation mismatch. Use it when you want a thrown failure instead of an exit code.

### Baseline flags on the CLI

`--baseline` loads a snapshot and compares; `--save` writes the current result. Three protections matter:

- A missing baseline file prints a notice to stderr and the suite still runs, so `--save` can bootstrap the first snapshot.
- When the run is a subset (explicit `caseIds`, `tags`, `caseFilter`, or a shard), removed cases are ignored so the filtered-out cases do not appear as regressions. Pass `compareOptions.ignoreRemovedCases: false` to opt out.
- Writing the same path you read from is skipped when regressions were detected, or when the run was filtered or sharded, and the reason is printed. Otherwise the baseline is replaced.

`--save` forwards `redact` but **not** `maxValueLength`, so a stored baseline is not truncated the way printed output is.

## Compare two targets

`compareEvalTargets` runs several targets over the same cases and compares each with a baseline target:

```ts
const { results, comparisons } = await compareEvalTargets({
  name: 'prompt-v2',
  cases,
  metrics,
  targets: { current: v1Target, candidate: v2Target },
  baselineTarget: 'current',
})

comparisons.candidate.hasRegressions
```

The baseline defaults to the first key, and an unknown name throws. Each target runs under `<name>:<target>`, comparisons exclude the baseline, and a shared `targetCache` is namespaced per target so one target never returns another's outputs.

## Load cases from a file

```ts
import { loadEvalCases, runEvalSuite } from '@anvia/core/evals'

const cases = await loadEvalCases<string, string>('evals/cases.jsonl', { autoId: true })
await runEvalSuite({ ...suite, cases })
```

`loadEvalCases(path, { format, autoId, schema })` reads a JSON array, a `{ cases: [...] }` object, or JSONL/NDJSON. `format` defaults to `auto`, which picks JSONL for `.jsonl` and `.ndjson` paths. Every record needs an `input` own-property; `id` must be a non-empty string unless `autoId` generates `case-<n>` ids that skip any id already used in the file. `schema` adds Zod validation and reports the first failing index.

Validation is strict and typed: duplicate ids, a missing `input`, malformed JSONL lines, and a top-level shape other than an array or `{ cases }` all throw `TypeError` with the file and index in the message. A dataset file is untrusted input, so validate it before a case reaches a judge or a reporter.

## A complete gate

```ts anvia-check eval-cli-gate
import {
  assertEvalPassed, compareEvalResults, defineEvalSuite, exactMatch,
  formatEvalComparison, runEvalSuite,
} from '@anvia/core/evals'

const suite = defineEvalSuite({
  name: 'normalizer-gate',
  cases: [
    { id: 'trim', input: '  hello  ', expected: 'hello' },
    { id: 'collapse', input: 'a   b', expected: 'a b' },
  ],
  target: async (input) => input.trim().replace(/\s+/g, ' '),
  metrics: [exactMatch({ name: 'normalized' })],
})

const baseline = await runEvalSuite(suite)
const candidate = await runEvalSuite(suite)

assertEvalPassed(candidate)
console.log(candidate.passed, candidate.metricSummaries.normalized.passRate) // true, 1

const comparison = compareEvalResults(baseline, candidate)
console.log(comparison.hasRegressions, comparison.unchanged) // false, 2

const text = formatEvalComparison(comparison)
console.log(text.includes('Comparison: normalizer-gate'))
```

Store the baseline once, then compare against the stored file in CI so a threshold change is a reviewable diff rather than a moving target.
