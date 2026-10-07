import { ChatMessage } from "@/types";
import { StyleSheet, Text, View } from "react-native";


type Props = {
  message: ChatMessage;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser
          ? styles.userContainer
          : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? styles.userBubble
            : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser
              ? styles.userText
              : styles.assistantText,
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
  },

  userContainer: {
    alignItems: "flex-end",
  },

  assistantContainer: {
    alignItems: "flex-start",
  },

  bubble: {
    maxWidth: "84%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },

  userBubble: {
    backgroundColor: "#111827",
    borderBottomRightRadius: 6,
  },

  assistantBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 6,
  },

  text: {
    fontSize: 16,
    lineHeight: 23,
  },

  userText: {
    color: "#FFFFFF",
  },

  assistantText: {
    color: "#111827",
  },
});