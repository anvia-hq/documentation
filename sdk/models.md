# Models

Models are provider-backed capability objects. Each model does one kind of work through a provider-neutral Anvia contract, so application code can depend on the capability instead of a provider SDK.

## Choose a model family

| Model | Use it for |
| --- | --- |
| [Completion](/sdk/models/completion) | Generate text, run agents, call tools, and return structured output. |
| [Embeddings](/sdk/models/embeddings) | Turn text into vectors for semantic search and retrieval. |
| [Image generation](/sdk/models/image-generation) | Create images from text prompts. |
| [Audio generation](/sdk/models/audio-generation) | Generate speech or other audio from text. |
| [Transcription](/sdk/models/transcription) | Convert audio into text. |
| [OCR](/sdk/models/ocr) | Extract text and structure from documents and images. |

Provider packages expose only the model families they support.

## Create models at the provider boundary

```ts
import {
  GPT_IMAGE_1,
  TTS_1,
  WHISPER_1,
  OpenAIClient,
} from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const completion = openai.completionModel('gpt-5.5')
const embeddings = openai.embeddingModel('text-embedding-3-small')
const image = openai.imageGenerationModel(GPT_IMAGE_1)
const audio = openai.audioGenerationModel(TTS_1)
const transcription = openai.transcriptionModel(WHISPER_1)
```

Keep provider clients and credentials in server-side configuration or factories. Pass the returned model into the runtime primitive that needs it.

## Verify exact capabilities

Model support varies by provider, model ID, account, region, and endpoint. Test the precise feature your workflow uses—such as streaming, tool calls, schemas, input media, dimensions, voices, or output formats—before enabling a model in production.

Use the [provider capability matrix](https://anvia.dev/docs/providers/capability-matrix) to narrow the choices, then run a small workflow-specific smoke test.
