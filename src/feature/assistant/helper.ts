import { AssistantIntent, SupportedApp } from "@/types";
import * as Linking from "expo-linking"
 
export const appAliases: Record<string, SupportedApp> = {
  youtube: "youtube",
  "you tube": "youtube",

  chrome: "chrome",
  browser: "chrome",
  google: "chrome",

  whatsapp: "whatsapp",
  "what's app": "whatsapp",

  maps: "maps",
  "google maps": "maps",

  settings: "settings",
  
};

// function detectApp(text: string): SupportedApp | null {
//   const normalized = text.toLowerCase();

//   for (const [alias, app] of Object.entries(appAliases)) {
//     if (normalized.includes(alias)) {
//       return app;
//     }
//   }

//   return null;
// }

// export function parseIntent(
//   text: string,
// ): AssistantIntent {
//   const normalized = text.trim().toLowerCase();

//   // Open app
//   if (
//     normalized.startsWith("open ") ||
//     normalized.startsWith("launch ") ||
//     normalized.startsWith("start ")
//   ) {
//     const app = detectApp(normalized);

//     if (app) {
//       return {
//         type: "open_app",
//         app,
//       };
//     }
//   }

//   // Calculator
//   if (
//     normalized.startsWith("calculate ") ||
//     normalized.startsWith("what is ") ||
//     normalized.startsWith("what's ")
//   ) {
//     const expression = normalized
//       .replace(/^calculate\s+/i, "")
//       .replace(/^what is\s+/i, "")
//       .replace(/^what's\s+/i, "");

//     if (/[0-9]/.test(expression)) {
//       return {
//         type: "calculate",
//         expression,
//       };
//     }
//   }

//   // Search
//   if (
//     normalized.startsWith("search for ") ||
//     normalized.startsWith("search ") ||
//     normalized.startsWith("google ")
//   ) {
//     const query = text
//       .replace(/^search for\s+/i, "")
//       .replace(/^search\s+/i, "")
//       .replace(/^google\s+/i, "")
//       .trim();

//     return {
//       type: "web_search",
//       query,
//     };
//   }

//   // Call
//   if (normalized.startsWith("call ")) {
//     const phoneNumber = text
//       .replace(/^call\s+/i, "")
//       .trim();

//     if (/^[+\d\s()-]+$/.test(phoneNumber)) {
//       return {
//         type: "call",
//         phoneNumber,
//       };
//     }
//   }

//   return {
//     type: "unknown",
//   };
// }


const appUrls: Record<SupportedApp, string> = {
  youtube: "youtube://",
  chrome: "googlechrome://",
  whatsapp: "whatsapp://",
  maps: "geo:0,0?q=",
  settings: "app-settings:",
};

const webFallbacks: Partial<Record<SupportedApp, string>> = {
  youtube: "https://www.youtube.com",
  chrome: "https://www.google.com",
  whatsapp: "https://www.whatsapp.com",
  maps: "https://maps.google.com",
};

export async function openApp(app: SupportedApp) {
  const url = appUrls[app];

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);

      return {
        success: true,
        message: `Opening ${getAppName(app)}.`,
      };
    }

    const fallback = webFallbacks[app];

    if (fallback) {
      await Linking.openURL(fallback);

      return {
        success: true,
        message: `I couldn't open the app, so I opened ${getAppName(
          app,
        )} in the browser.`,
      };
    }

    return {
      success: false,
      message: `I couldn't open ${getAppName(app)}.`,
    };
  } catch {
    return {
      success: false,
      message: `I couldn't open ${getAppName(app)}.`,
    };
  }
}

function getAppName(app: SupportedApp) {
  switch (app) {
    case "youtube":
      return "YouTube";

    case "chrome":
      return "Chrome";

    case "whatsapp":
      return "WhatsApp";

    case "maps":
      return "Maps";

    case "settings":
      return "Settings";

    default:
      return app;
  }
}

//---------

import * as WebBrowser from "expo-web-browser";

export async function searchWeb(query: string) {
  const url =
    `https://www.google.com/search?q=` +
    encodeURIComponent(query);

  await WebBrowser.openBrowserAsync(url);

  return {
    success: true,
    message: `Searching for "${query}".`,
  };
}


//-----
export function calculate(expression: string) {
  const cleaned = expression
    .replace(/[^0-9+\-*/().% ]/g, "")
    .trim();

  if (!cleaned) {
    return {
      success: false,
      message: "I couldn't understand that calculation.",
    };
  }

  try {
    // Basic arithmetic only.
    const result = Function(
      `"use strict"; return (${cleaned})`,
    )();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error("Invalid result");
    }

    return {
      success: true,
      message: String(result),
    };
  } catch {
    return {
      success: false,
      message: "I couldn't calculate that.",
    };
  }
}


//-----
 
//---

export async function callNumber(phoneNumber: string) {
  const url = `tel:${phoneNumber}`;

  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    return {
      success: false,
      message: "Calling isn't available on this device.",
    };
  }

  await Linking.openURL(url);

  return {
    success: true,
    message: `Calling ${phoneNumber}.`,
  };
}