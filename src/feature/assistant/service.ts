import { parseIntent,openApp,searchWeb,calculate,callNumber } from "./helper";

 

export async function handleAssistantMessage(
  text: string,
): Promise<string> {
  const intent = parseIntent(text);

  switch (intent.type) {
    case "open_app": {
      const result = await openApp(intent.app);

      return result.message;
    }

    case "web_search": {
      const result = await searchWeb(intent.query);

      return result.message;
    }

    case "calculate": {
      const result = calculate(intent.expression);

      return result.message;
    }

    case "call": {
      const result = await callNumber(
        intent.phoneNumber,
      );

      return result.message;
    }

    case "whatsapp": {
      return "WhatsApp actions aren't implemented yet.";
    }

    case "unknown":
    default:
      return (
        "I don't know how to do that yet.\n\n" +
        "Try:\n" +
        "• Open YouTube\n" +
        "• Search for React Native\n" +
        "• Calculate 25 * 18\n" +
        "• Call 9876543210"
      );
  }
}