import { StyleSheet, Text, View } from "react-native";

export function TypingIndicator() {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>Thinking...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    marginBottom: 12,
  },

  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    backgroundColor: "#F3F4F6",
  },

  text: {
    color: "#6B7280",
    fontSize: 15,
  },
});