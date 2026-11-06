 
export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
};

export type AssistantIntent =
  | {
      type: "open_app";
      app: SupportedApp;
    }
  | {
      type: "web_search";
      query: string;
    }
  | {
      type: "calculate";
      expression: string;
    }
  | {
      type: "call";
      phoneNumber: string;
    }
  | {
      type: "whatsapp";
      phoneNumber?: string;
      message?: string;
    }
  | {
      type: "unknown";
    };

export type SupportedApp =
  | "youtube"
  | "chrome"
  | "whatsapp"
  | "maps"
  | "settings";