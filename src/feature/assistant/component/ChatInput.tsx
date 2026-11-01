import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import { startWakeWordListening } from "./wake-word/WakeWordListener";

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
  const [isListening, setIsListening] = useState(false);

  const canSend = value.trim().length > 0 && !disabled;

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("Speech recognition error:", event.error);
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results?.[0]?.transcript;
    console.log("Speech recognition success:", text);
 if (text) {
      onChangeText(text);
    }
  });

  const startListening = async () => {
    if (disabled || isListening) {
      return;
    }

    const result =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!result.granted) {
      console.log("Microphone permission denied");
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: "en-IN",
      interimResults: true,
      continuous: false,
    });
  };

  const stopListening = () => {
    if (!isListening) {
      return;
    }

    ExpoSpeechRecognitionModule.stop();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
  let mounted = true;
  let stopListeningsetup: (() => Promise<void>) | undefined;

  async function setup() {
    try {
      console.log("[WakeWord] Starting listener...");

      const stop = await startWakeWordListening((yo) => {
        console.log("[WakeWord] Detected:", yo);
        setTimeout(() => {
                  startListening()

        }, 2000);
      });

      if (!mounted) {
        // await stop();
        return;
      }

      // stopListening = stop;
      // setStatus("Listening for Hey Jarvis");
    } catch (error) {
      console.error("[WakeWord] Initialization failed:", error);

      if (mounted) {
        // setStatus(
        //   `Failed: ${
        //     error instanceof Error ? error.message : String(error)
        //   }`
        // );
      }
    }
  }

  void setup();

  return () => {
    mounted = false;

    if (stopListeningsetup) {
      void stopListeningsetup().catch((error) => {
        console.error("[WakeWord] Stop failed:", error);
      });
    }
  };
}, []);

  return (
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

      {/* Mic */}
      <Pressable
        onPress={toggleListening}
        disabled={disabled}
        style={[
          styles.micButton,
          isListening && styles.micListening,
          disabled && styles.disabled,
        ]}
      >
        <Text style={styles.micText}>
          {isListening ? "■" : "🎤"}
        </Text>
      </Pressable>

      {/* Send */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",

    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,

    gap: 8,

    backgroundColor: "#FFFFFF",

    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },

  input: {
    flex: 1,

    minHeight: 46,
    maxHeight: 120,

    paddingHorizontal: 16,
    paddingVertical: 10,

    borderRadius: 23,

    backgroundColor: "#F3F4F6",

    color: "#111827",
    fontSize: 16,

    textAlignVertical: "center",
  },

  micButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F3F4F6",
  },

  micListening: {
    backgroundColor: "#FEE2E2",
  },

  micText: {
    fontSize: 20,
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
    fontSize: 26,
    fontWeight: "600",
    lineHeight: 28,
  },
});