
import { loadModel } from "./model-manager.service";


// export async function generateResponse(
//   prompt: string,
// ): Promise<string> {
//   const context = await loadModel();
// console.log({prompt,l:'🤖'});

//   const result = await context.completion({
//     messages: [
//       {
//         role: "system",
//        content:
//         "You are Pri, a personal Android assistant. " +
//         "You are helpful, intelligent, and concise. " +
//         "Understand the user's intent before responding. " +
//         "Give direct answers without unnecessary explanations. " +
//         "For simple questions, answer in one or two sentences. " +
//         "For commands, identify the required action clearly. " +
//         "Never invent information. " +
//         "If you do not understand, ask one short clarification question. " +
//         "Do not reveal internal reasoning.",
//      },
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],

//     n_predict: MODEL_CONFIG.maxTokens,

//     temperature: 0.2,

//     top_p: 0.8,


//     top_k: 20,
//   });
// console.log("🤖 RAW MODEL RESULT:", result);
// console.log("🤖 GENERATED TEXT:", result.text);

//   return result.text.trim();
// }



export async function generateResponse(prompt: string) {
   const context = await loadModel();
// console.log({prompt,l:'🤖'});
  const result = await context.completion({
    messages: [
      {
        role: "system",
        content:
          "You are Pri, a fast and helpful personal Android assistant. " +
          "Answer naturally and directly. " +
          "Keep responses short and conversational. " +
          "Follow the user's instructions precisely. " +
          "Do not include explanations unless requested. " +
          "Never invent facts.",
      },
      {
        role: "user",
        content: `${prompt}\n/no_think`,
      },
    ],

    n_predict: 128,

    temperature: 0.7,

    top_p: 0.8,

    top_k: 20,

    // repeat_penalty: 1.05,
  });

  // Remove any visible thinking blocks as a safeguard.
  const response = result.text
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "")
    .replace(/<\/?think>/gi, "")
    .trim();

  console.log("PRI RESPONSE:", response);

  return response;
}
