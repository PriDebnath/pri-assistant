
import { initLlama } from "llama.rn";

import { MODEL_CONFIG } from "./model.config";
import { getDownloadedModelPath } from "./model-download.service";

type LlamaContext = Awaited<
  ReturnType<typeof initLlama>
>;

let context: LlamaContext | null = null;

let loadingPromise: Promise<LlamaContext> | null = null;

export function isModelLoaded(): boolean {
  return context !== null;
}

export async function loadModel(): Promise<LlamaContext> {
  if (context) {
    return context;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const modelPath = getDownloadedModelPath();
console.log({modelPath});

    if (!modelPath) {
      throw new Error("Please download the AI model first.");
    }

    const llamaContext = await initLlama(
      {
        model: modelPath,
  // model: "D:/a/model.gguf",

        n_ctx: MODEL_CONFIG.contextSize,

        n_batch: MODEL_CONFIG.batchSize,

        n_threads: MODEL_CONFIG.threads,

        // Avoid locking the entire model in RAM.
        use_mlock: false,
      },
      (progress) => {
        console.log(
          `[Assistant] Loading model: ${Math.round(progress * 100)}%`,
        );
      },
    );
console.log({llamaContext});

    return llamaContext;
  })();

  try {
    context = await loadingPromise;
    return context;
  } finally {
    loadingPromise = null;
  }
}

export async function unloadModel(): Promise<void> {
  if (loadingPromise) {
    await loadingPromise;
  }

  if (!context) {
    return;
  }

  const currentContext = context;
  context = null;

  await currentContext.release();

  console.log("[Assistant] Model unloaded.");
}
