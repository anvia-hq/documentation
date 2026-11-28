# Trials and caching

Two suite options change how a case is judged without changing the target or the metrics: run the same case several times, and reuse an earlier target output.

## Run a case more than once

A stochastic target needs more than one sample. `trials` repeats the target (and that trial's metrics) inside the case:

```ts
const result = await runEvalSuite({
  ...suite,
  trials: 3,
})
```

`trials: 3` is shorthand for `{ count: 3, minPassRate: 1 }`, which requires every trial to pass. Set the rate explicitly when a flaky target is acceptable:

```ts
const result = await runEvalSuite({
  ...suite,
  trials: { count: 3, minPassRate: 2 / 3 },
})
```

`minPassRate` is exclusive of zero and at most `1`. With a rate below `1`, the case passes while `trials.passed / trials.count` clears it.

```ts
result.results[0]?.trials
// {
//   count: 3, passed: 2, failed: 1, invalid: 0, passRate: 0.66,
//   passAtK: true,     // at least one trial passed
//   passAllK: false,   // not every trial passed
//   minPassRate: 0.66,
//   runs: [...],       // per-trial outcome, output, durations, metrics, cached
// }
```

`passAtK` is `true` when at least one trial's outcome was `pass`, and `passAllK` when every trial's outcome was `pass`; failed and invalid trials count against both. `k` is the trial count, not a separate option. A case whose trials pass at exactly `minPassRate` still passes.

The overall outcome follows the rate: `pass` when `passed / count >= minPassRate`. Otherwise it is `invalid` when at least one trial is invalid and either no trial failed or `(passed + failed) / count` is below `minPassRate` (the decided trials alone cannot settle the case); everything else is `fail`. Metrics are evaluated per trial, so aggregate `usage` and `cost` are sums over trials.

Trials run sequentially inside a case even when `targetConcurrency` is greater than one. Use concurrency across cases, and keep trial counts modest because each trial is a full target run.

## Filter cases by tag

`tags` on a case and a `tags` filter on the suite keep a run focused:

```ts
const suite = defineEvalSuite({
  name: 'refund-policy',
  cases: [
    { id: 'window', input: 'How long?', expected: '30 days', tags: ['smoke', 'policy'] },
    { id: 'edge', input: 'After 30 days?', expected: 'denied', tags: ['policy'] },
  ],
  target: async () => '30 days',
  metrics: [contains()],
})

await runEvalSuite({ ...suite, tags: ['smoke'] }) // runs `window` only
```

A case matches when any of its tags is in the filter. Cases without tags never match a tag filter, and filtering happens before `shard`.

## Decorate a target with a cache

`cachedEvalTarget` and the `targetCache` suite option share one cache contract. (`agentEvalTarget` only adapts an agent into a target; it does not cache, so wrap it or pass `targetCache` when you want reuse.) Keep the cache key in mind: it is `<caseId>::trial=<n>::<JSON of case.input>`. `expected`, `context`, `retrievalContext`, `tags`, `metadata`, and the request builder are not part of the key. Two cases with different expectations but the same `id` and `input` therefore share an entry.

```ts
import { createFileEvalCache, cachedEvalTarget, runEvalSuite } from '@anvia/core/evals'

const target = cachedEvalTarget(myTarget, createFileEvalCache('.eval-cache/targets.json'))

await runEvalSuite({ ...suite, target })
```

`createMemoryEvalCache()` is the in-process equivalent and exposes `clear()` and `size`. Both accept `{ keyFor(testCase, trial) }` when the default key is not specific enough; make a custom key include everything that changes the output.

`defaultEvalCacheKey(testCase, trial)` is exported when you need the default string itself.

```ts
const result = await runEvalSuite({ ...suite, targetCache: createMemoryEvalCache() })
result.results[0]?.cached // true on a hit, absent otherwise
```

Three rules are easy to get wrong:

- `cached` is `true` or absent, never `false`.
- Do not wrap a target in `cachedEvalTarget` and also pass `targetCache` for the same entries. The suite records only the hits it performs itself, so the inner wrapper's hits are invisible and the runner then writes its own copy.
- A hit restores the recorded `targetDurationMs`, so `maxDurationMs` judges the original duration rather than zero.

Cache failures handled by the runner do not fail the run: a failed read runs the target anyway, and a failed write still returns the result. This covers `targetCache` and a `cachedEvalTarget` passed on its own, which the runner unwraps. When a `cachedEvalTarget` is combined with `targetCache`, the wrapper runs as a plain target and its cache errors become target failures. `createFileEvalCache` recovers after a failed write and retries a load that failed once, which makes a broken cache path a performance problem rather than a correctness one.

Caches reduce provider spend and make reruns deterministic, but a stale entry can hide a target regression. Delete the cache file when you change the target, and never share a cache across targets: use [`compareEvalTargets`](/sdk/evaluations/cli-and-baselines#compare-two-targets), which namespaces the cache per target.
