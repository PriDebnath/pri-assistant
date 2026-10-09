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

export function WakeWordTest() {
  const [status, setStatus] =
    useState("Loading wake-word model...");

  useEffect(() => {
    let mounted = true;

    async function setup() {
      try {
        await initializeWakeWord();

        if (mounted) {
          setStatus(
            "Wake-word model loaded"
          );
        }
      } catch (error) {
        console.error(
          "[WakeWord] Initialization failed:",
          error
        );

        if (mounted) {
          setStatus(
            `Failed: ${
              error instanceof Error
                ? error.message
                : String(error)
            }`
          );
        }
      }
    }

    setup();

    return () => {
      mounted = false;
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