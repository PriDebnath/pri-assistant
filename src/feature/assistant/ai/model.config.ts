
export const MODEL_CONFIG = {
  id: "qwen3-0.6b-q4km",

  name: "Qwen3 0.6B",

  fileName: "qwen3-0.6b.gguf",
  // fileName: "Qwen3-0.6B-Q4_K_M.gguf",

  downloadUrl:
    "https://huggingface.co/bartowski/Qwen_Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_K_M.gguf",

  // Approximate size: 484 MB
  expectedSize: 484 * 1024 * 1024,

  contextSize: 2048,

  threads: 4,

  batchSize: 256,

  maxTokens: 128,
} as const;
