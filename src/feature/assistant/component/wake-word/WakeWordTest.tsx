import {
  useEffect,
  useState,
} from "react";

import {
  Text,
  View,
} from "react-native";

import {
  initializeWakeWord,
} from "./WakeWordDetector";
import { startWakeWordListening } from "./WakeWordListener";

export function WakeWordTest() {
  const [status, setStatus] =
    useState("Loading wake-word model...");

useEffect(() => {
  let mounted = true;
  let stopListening: (() => Promise<void>) | undefined;

  async function setup() {
    try {
      console.log("[WakeWord] Starting listener...");

      // const stop = await startWakeWordListening((yo) => {
        console.log("[WakeWord] Detected:", 'yo');
      // });

      if (!mounted) {
        await stop();
        return;
      }

      // stopListening = stop;
      setStatus("Listening for Hey Jarvis");
    } catch (error) {
      console.error("[WakeWord] Initialization failed:", error);

      if (mounted) {
        setStatus(
          `Failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }

  void setup();

  return () => {
    mounted = false;

    if (stopListening) {
      void stopListening().catch((error) => {
        console.error("[WakeWord] Stop failed:", error);
      });
    }
  };
}, []);

  return (
    <View
      style={{
        padding: 20,
      }}
    >
      <Text>
        {status}
      </Text>
    </View>
  );
}