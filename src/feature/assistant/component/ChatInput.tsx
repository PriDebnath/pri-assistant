import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled = false,
}: Props) {
  const canSend =
    value.trim().length > 0 && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <View style={styles.container}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask anything..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={2000}
          editable={!disabled}
          style={styles.input}
        />

        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            !canSend && styles.disabled,
          ]}
        >
          <Text style={styles.sendText}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 23,
    backgroundColor: "#F3F4F6",
    color: "#111827",
    fontSize: 16,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },

  disabled: {
    opacity: 0.35,
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
  },
});