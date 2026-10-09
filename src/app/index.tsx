import { ChatInput } from "@/feature/assistant/component/ChatInput";
import { MessageBubble } from "@/feature/assistant/component/MessageBubble";
import { TypingIndicator } from "@/feature/assistant/component/TypingIndicator";
import { handleAssistantMessage } from "@/feature/assistant/service";
import { ChatMessage } from "@/types";
import { useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

// import { ChatInput } from "@/src/components/ChatInput";
// import { MessageBubble } from "@/src/components/MessageBubble";
// import { TypingIndicator } from "@/src/components/TypingIndicator";

// import { handleAssistantMessage } from "@/src/assistant/assistant.service";

// import type { ChatMessage } from "@/src/types/chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { WakeWordTest } from "@/feature/assistant/component/wake-word/WakeWordTest";

export default function HomeScreen() {
  const [messages, setMessages] =
    useState<ChatMessage[]>([
      {
        id: "welcome",
        role: "assistant",
        text:
          "Hi! I'm your assistant. " +
          "Tell me what you want to do.",
        createdAt: Date.now(),
      },
    ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] =
    useState(false);

  const listRef =
    useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({
        animated: true,
      });
    }, 50);
  }, [messages, isThinking]);

  async function sendMessage() {
    const text = input.trim();

    if (!text || isThinking) {
      return;
    }

    setInput("");

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text,
      createdAt: Date.now(),
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setIsThinking(true);

    try {
      const response =
        await handleAssistantMessage(text);
      Speech.speak(response, {
        language: "en-IN",
        pitch: 1,
        rate: 0.9,
      });
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: response,
        createdAt: Date.now(),
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text:
            "Something went wrong while trying to do that.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    // <SafeAreaView >
    <SafeAreaView
      style={styles.safeArea}
      // style={styles.safe}
      edges={["top", "bottom"]}
      testID="on-board-screen"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar backgroundColor={'#1a01ff'} hidden={false}
        />

        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                Assistant
              </Text>
<WakeWordTest/>
              <Text style={styles.subtitle}>
                Your personal assistant
              </Text>
            </View>

            <View style={styles.status}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                Local
              </Text>
            </View>
          </View>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble message={item} />
            )}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              isThinking ? <TypingIndicator /> : null
            }
          />

        </View>


        <ChatInput
          value={input}
          onChangeText={setInput}
          onSend={sendMessage}
          disabled={isThinking}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },

  statusText: {
    fontSize: 12,
    color: "#6B7280",
  },

  messages: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
});