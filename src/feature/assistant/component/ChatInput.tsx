
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

import { useCallback, useEffect, useRef, useState } from "react";
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

  const wakeWordStopRef = useRef<(() => Promise<void>) | null>(null);

  const mountedRef = useRef(true);
  const restartingRef = useRef(false);
  const speechStartedRef = useRef(false);

  const canSend = value.trim().length > 0 && !disabled;

  // Stop wake word listener
  const stopWakeWord = useCallback(async () => {
    const stop = wakeWordStopRef.current;

    if (!stop) return;

    wakeWordStopRef.current = null;

    try {
      await stop();
    } catch (error) {
      console.log("[WakeWord] Stop error:", error);
    }
  }, []);

  // Start wake word listener
  const startWakeWord = useCallback(async () => {
    if (!mountedRef.current || restartingRef.current) return;

    restartingRef.current = true;

    try {
      await stopWakeWord();

      console.log("[WakeWord] Starting...");

      const stop = await startWakeWordListening(() => {
        if (!mountedRef.current) return;

        console.log("[WakeWord] Detected!");

        // Prevent multiple speech recognition sessions.
        if (speechStartedRef.current) return;

        speechStartedRef.current = true;

        // Stop wake-word recorder before starting speech recognition.
        void stop().catch(console.error);

        wakeWordStopRef.current = null;

        void startSpeechRecognition();
      });

      if (!mountedRef.current) {
        await stop();
        return;
      }

      wakeWordStopRef.current = stop;

    } catch (error) {
      console.error("[WakeWord] Start failed:", error);
    } finally {
      restartingRef.current = false;
    }
  }, [stopWakeWord]);

  // Start speech recognition
  const startSpeechRecognition = useCallback(async () => {
    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        speechStartedRef.current = false;
        await startWakeWord();
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "en-IN",
        interimResults: true,
        continuous: false,
      });

    } catch (error) {
      console.error("[Speech] Start failed:", error);

      speechStartedRef.current = false;
      await startWakeWord();
    }
  }, [startWakeWord]);

  // Speech started
  useSpeechRecognitionEvent("start", () => {
    console.log("[Speech] Started");
    setIsListening(true);
  });

  // Speech recognition ended
  useSpeechRecognitionEvent("end", () => {
    console.log("[Speech] Ended");

    setIsListening(false);
    speechStartedRef.current = false;

    // Restart wake-word detection only after speech recognition ends.
    void startWakeWord();
  });

  // Speech recognition error
  useSpeechRecognitionEvent("error", (event) => {
    console.log("[Speech] Error:", event.error);

    setIsListening(false);
    speechStartedRef.current = false;

    void startWakeWord();
  });

  // Speech result
  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results?.[0]?.transcript;

    console.log("[Speech] Result:", text);

    if (text) {
      onChangeText(text);
    }

    // Do not restart wake word here.
    // Wait for the "end" event.
  });

  // Manual microphone control
  const startListening = async () => {
    if (disabled || isListening || speechStartedRef.current) return;

    speechStartedRef.current = true;

    await stopWakeWord();
    await startSpeechRecognition();
  };

  const stopListening = () => {
    if (!isListening) return;

    ExpoSpeechRecognitionModule.stop();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      void startListening();
    }
  };

  // Initial wake-word listener
  useEffect(() => {
    mountedRef.current = true;

    void startWakeWord();

    return () => {
      mountedRef.current = false;

      void stopWakeWord();
    };
  }, [startWakeWord, stopWakeWord]);

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
