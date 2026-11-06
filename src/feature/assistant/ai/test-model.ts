import { initLlama } from "llama.rn";

const context = await initLlama({
  model: "D:/a/model.gguf",
//   model: "D:/a/qwen3-0.6b.gguf",
  n_ctx: 2048,
  n_threads: 4,
});
console.log("Qwen3 loaded successfully!");
// const result = await context.completion({
//   prompt: "Hello, who are you?",
//   n_predict: 50,
// });

// console.log(result.text);

// console.log('gii');
