import type { AssistantIntent, SupportedApp } from "@/types";
import { generateResponse } from "../model-inference.service";
// import { generateResponse } from "./model/model-inference.service";

const SUPPORTED_APPS: SupportedApp[] = [
  "youtube",
  "chrome",
  "whatsapp",
  "maps",
  "settings",
];

const SYSTEM_PROMPT = `
You are the intent recognition engine for Pri, an Android personal assistant.

Your task is to convert the user's message into exactly ONE JSON object.

Supported intents:

1. Open an app:
{"type":"open_app","app":"youtube"}

Allowed apps: youtube, chrome, whatsapp, maps, settings.

2. Search the web:
{"type":"web_search","query":"React Native tutorials"}

3. Calculate:
{"type":"calculate","expression":"25 * 18"}

4. Make a phone call:
{"type":"call","phoneNumber":"9876543210"}

5. WhatsApp:
{"type":"whatsapp","phoneNumber":"9876543210","message":"Hello"}
Phone number and message are optional.

6. Unknown:
{"type":"unknown"}

Rules:
- Return valid JSON only.
- Do not use Markdown or code fences.
- Do not include explanations.
- Never invent phone numbers or message content.
- Preserve the user's actual search query.
- For WhatsApp messages, extract the phone number and message if provided.
- If the request is unclear or unsupported, return unknown.
`;

function extractJson(response: string): string | null {
  const cleaned = response
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```(?:json)?/gi, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    return null;
  }

  return cleaned.slice(start, end + 1);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateIntent(value: unknown): AssistantIntent {
  if (!value || typeof value !== "object") {
    return { type: "unknown" };
  }

  const intent = value as Record<string, unknown>;

  switch (intent.type) {
    case "open_app":
      if (
        typeof intent.app === "string" &&
        SUPPORTED_APPS.includes(intent.app as SupportedApp)
      ) {
        return {
          type: "open_app",
          app: intent.app as SupportedApp,
        };
      }
      break;

    case "web_search":
      if (isNonEmptyString(intent.query)) {
        return {
          type: "web_search",
          query: intent.query.trim(),
        };
      }
      break;

    case "calculate":
      if (
        isNonEmptyString(intent.expression) &&
        /^[\d\s()+\-*/%.]+$/.test(intent.expression)
      ) {
        return {
          type: "calculate",
          expression: intent.expression.trim(),
        };
      }
      break;

    case "call":
      if (
        isNonEmptyString(intent.phoneNumber) &&
        /^[+\d\s()-]+$/.test(intent.phoneNumber)
      ) {
        return {
          type: "call",
          phoneNumber: intent.phoneNumber.trim(),
        };
      }
      break;

    case "whatsapp": {
      const phoneNumber = intent.phoneNumber;
      const message = intent.message;

      if (
        (phoneNumber === undefined ||
          (isNonEmptyString(phoneNumber) &&
            /^[+\d\s()-]+$/.test(phoneNumber))) &&
        (message === undefined || isNonEmptyString(message))
      ) {
        return {
          type: "whatsapp",
          ...(typeof phoneNumber === "string"
            ? { phoneNumber: phoneNumber.trim() }
            : {}),
          ...(typeof message === "string"
            ? { message: message.trim() }
            : {}),
        };
      }
      break;
    }

    case "unknown":
      return { type: "unknown" };
  }

  return { type: "unknown" };
}

export async function parseIntentWithAI(
  userMessage: string,
): Promise<AssistantIntent> {
  const response = await generateResponse(
    `${SYSTEM_PROMPT}\n\nUser message: ${JSON.stringify(userMessage)}`
  );

  const json = extractJson(response);

  if (!json) {
    console.warn("[Assistant AI] Invalid JSON response:", response);
    return { type: "unknown" };
  }

  try {
    return validateIntent(JSON.parse(json));
  } catch (error) {
    console.warn("[Assistant AI] Failed to parse intent:", error);
    return { type: "unknown" };
  }
}