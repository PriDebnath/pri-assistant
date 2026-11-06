import { parseIntentWithAI } from "./ai/service/ai-intent.service";
import { openApp,searchWeb,calculate,callNumber, appAliases } from "./helper";
import { AssistantIntent, SupportedApp } from "@/types";

 

// export async function handleAssistantMessage(
//   text: string,
// ): Promise<string> {
//   const intent = parseIntent(text);

//   switch (intent.type) {
//     case "open_app": {
//       const result = await openApp(intent.app);

//       return result.message;
//     }

//     case "web_search": {
//       const result = await searchWeb(intent.query);

//       return result.message;
//     }

//     case "calculate": {
//       const result = calculate(intent.expression);

//       return result.message;
//     }

//     case "call": {
//       const result = await callNumber(
//         intent.phoneNumber,
//       );

//       return result.message;
//     }

//     case "whatsapp": {
//       return "WhatsApp actions aren't implemented yet.";
//     }

//     case "unknown":
//     default:
//       return (
//         "I don't know how to do that yet.\n\n" +
//         "Try:\n" +
//         "• Open YouTube\n" +
//         "• Search for React Native\n" +
//         "• Calculate 25 * 18\n" +
//         "• Call 9876543210"
//       );
//   }
// }

const    DEAFAULT_UNKNOWN   = (

        "I don't know how to do that yet.\n\n" +
        "Try:\n" +
        "• Open YouTube\n" +
        "• Search for React Native\n" +
        "• Calculate 25 * 18\n" +
        "• Call 9876543210"
      );

      const    AI_UNKNOWN   = (
        " 🤖 I don't know how to do that yet.\n\n" +
        "Try:\n" +
        "• Open YouTube\n" +
        "• Search for React Js\n" +
        "• Calculate 25 * 18\n" +
        "• Call 9876543210"
      );

export async function handleAssistantMessage(
  text: string,
): Promise<string> {
  let intent = parseIntent(text);
console.log('🤖 Using AI');
let UNKNOWN_INTENT: string =DEAFAULT_UNKNOWN;

  // Use Qwen3 only when the rule-based parser cannot understand.
  if (intent.type === "unknown") {
    try {
      console.log("[Assistant] Trying AI intent recognition...");
      intent = await parseIntentWithAI(text);
      console.log("[Assistant] AI intent:", intent);
 UNKNOWN_INTENT =AI_UNKNOWN;

    } catch (error) {
      console.error("[Assistant] AI recognition failed:", error);

      return "I couldn't understand that request. Please try again.";
    }
  }

  switch (intent.type) {
    case "open_app":
      return (await openApp(intent.app)).message;

    case "web_search":
      return (await searchWeb(intent.query)).message;

    case "calculate":
      return calculate(intent.expression).message;

    case "call":
      return (await callNumber(intent.phoneNumber)).message;

    case "whatsapp":
      return "WhatsApp actions aren't implemented yet.";

    case "unknown":
    default: return UNKNOWN_INTENT

  }
}

const appNames = Object.keys(appAliases).sort(
  (a, b) => b.length - a.length,
);

// Normalize text
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?!,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Remove polite introductory phrases
function removePolitePrefix(text: string): string {
  return text.replace(
    /^(please\s+|can you\s+|could you\s+|would you\s+|hey\s+assistant\s+|assistant\s+|hey\s+)+/i,
    "",
  ).trim();
}

// Find supported application
function detectApp(text: string): SupportedApp | null {
  for (const alias of appNames) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pattern = new RegExp(
      `(?:^|\\s)${escaped}(?=\\s|$)`,
      "i",
    );

    if (pattern.test(text)) {
      return appAliases[alias];
    }
  }

  return null;
}

// Extract calculator expression
// function extractExpression(text: string): string | null {
//   let expression = text
//     .replace(/^(calculate|compute|solve|what is|what's|how much is)\s+/i, "")
//     .trim();

//   // Convert spoken mathematical operators
//   const replacements: [RegExp, string][] = [
//     [/\bmultiplied by\b|\btimes\b|\binto\b|\bmultiplied\b|\bby\b/gi, "*"],
//     [/\bdivided by\b|\bdivide\b/gi, "/"],
//     [/\bplus\b|\badded to\b/gi, "+"],
//     [/\bminus\b|\bsubtract\b/gi, "-"],
//     [/\bmodulo\b|\bmod\b/gi, "%"],
//   ];

//   for (const [pattern, replacement] of replacements) {
//     expression = expression.replace(pattern, replacement);
//   }

//   expression = expression.replace(/,/g, "");

//   // Only allow arithmetic characters
//   if (!/[0-9]/.test(expression)) return null;

//   if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
//     return null;
//   }

//   return expression.trim();
// }


function extractExpression(text: string): string | null {
  let expression = text
    .replace(
      /^(calculate|compute|solve|what is|what's|how much is)\s+/i,
      "",
    )
    .trim();

  // Spoken arithmetic patterns
  const spokenPatterns: [RegExp, string][] = [
    [/^multiply\s+(.+?)\s+by\s+(.+)$/i, "$1 * $2"],
    [/^divide\s+(.+?)\s+by\s+(.+)$/i, "$1 / $2"],
    [/^add\s+(.+?)\s+and\s+(.+)$/i, "$1 + $2"],
    [/^subtract\s+(.+?)\s+from\s+(.+)$/i, "$2 - $1"],
  ];

  for (const [pattern, replacement] of spokenPatterns) {
    if (pattern.test(expression)) {
      expression = expression.replace(pattern, replacement);
      break;
    }
  }

  const replacements: [RegExp, string][] = [
    [/\bmultiplied by\b|\btimes\b|\binto\b/gi, "*"],
    [/\bdivided by\b/gi, "/"],
    [/\bplus\b/gi, "+"],
    [/\bminus\b/gi, "-"],
    [/\bmodulo\b|\bmod\b/gi, "%"],
  ];

  for (const [pattern, replacement] of replacements) {
    expression = expression.replace(pattern, replacement);
  }

  expression = expression.replace(/,/g, "");

  if (!/[0-9]/.test(expression)) return null;

  if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
    return null;
  }

  return expression.trim();
}


export function parseIntent(text: string): AssistantIntent {
  const normalized = normalizeText(text);
  const command = removePolitePrefix(normalized);

  if (!command) {
    return { type: "unknown" };
  }

  // 1. Web search (check before app detection)
  const searchMatch = command.match(
    /^(?:search(?:\s+for)?|google|look\s+up|find\s+information\s+about)\s+(.+)$/i,
  );

  if (searchMatch?.[1]) {
    return {
      type: "web_search",
      query: searchMatch[1].trim(),
    };
  }

  // 2. Phone call
  const callMatch = command.match(
    /^(?:call|phone|dial|ring)\s+(.+)$/i,
  );

  if (callMatch?.[1]) {
    const phoneNumber = callMatch[1].trim();

    if (/^\+?[\d\s()-]+$/.test(phoneNumber) && /\d{5,}/.test(phoneNumber)) {
      return {
        type: "call",
        phoneNumber,
      };
    }
  }

  // 3. Calculator
  if (
    // /^(calculate|compute|solve|what is|what's|how much is)\s+/i.test(command)
  /^(calculate|compute|solve|what is|what's|how much is|multiply|divide|add|subtract)\s+/i.test(command)
  ) {
    const expression = extractExpression(command);

    if (expression) {
      return {
        type: "calculate",
        expression,
      };
    }
  }

  // 4. Open application
  const openMatch = command.match(
    /^(?:open|launch|start|run|go to)\s+(.+)$/i,
  );

  if (openMatch?.[1]) {
    const app = detectApp(openMatch[1].trim());

    if (app) {
      return {
        type: "open_app",
        app,
      };
    }
  }

  return { type: "unknown" };
}
