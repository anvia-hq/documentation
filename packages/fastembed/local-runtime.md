# Local runtime

FastEmbed performs inference in the application process. That changes deployment planning compared with a hosted embedding API.

## Model initialization

`createFastEmbedEmbeddingModel()` initializes `FlagEmbedding`; the sparse factory initializes `SparseTextEmbedding`. First use may download model files into the configured cache.

Initialize models during application startup, not inside every request:

```ts
export const embeddings = await createFastEmbedEmbeddingModel({
  initOptions: {
    cacheDir: process.env.FASTEMBED_CACHE_DIR,
    showDownloadProgress: false,
  },
})
```

## Deployment image

The adapter is intended for Node.js/server workloads supported by the `fastembed` native runtime. Test the exact operating system, architecture, libc, and execution provider used in production. A successful TypeScript build does not prove native model loading will work in the final container.

## Cache and network

Model assets can require network access on first initialization. For controlled deployments, warm or prepopulate the cache and mount it read-only at runtime when appropriate. Ensure the process user can read the files and that concurrent replicas do not corrupt a shared writable cache.

## Capacity

`maxBatchSize` does not limit the number of simultaneous calls. Add application concurrency control when many requests could run local inference at once. Measure CPU, memory, initialization time, and tail latency with production-sized text.

## Privacy

Local inference avoids sending input text to a model provider, but the application still processes and stores the text. Apply the same logging, retention, and access policy used for source documents and retrieval results.

## Shutdown

The public model contract does not expose a cleanup method. If an injected custom runtime owns native handles requiring cleanup, the application that created that runtime must manage them outside the adapter.
