import { Openwakeword } from "react-native-openwakeword";
import { prepareWakeWordModels } from "./WakeWordModels";
import type { WakeWordDetector } from "react-native-openwakeword";

function toNativePath(uri: string): string {
  return decodeURIComponent(uri.replace(/^file:\/\//, ""));
}

export async function initializeWakeWord() {
  const models = await prepareWakeWordModels();

  const melspecPath = toNativePath(models.melspectrogram);
  const embeddingPath = toNativePath(models.embedding);
  const wakeWordPath = toNativePath(models.heyJarvis);

  console.log("[WakeWord] Native model paths:", {
    melspecPath,
    embeddingPath,
    wakeWordPath,
  });

  const detector = await Openwakeword.createDetector({
    melspecPath,
    embeddingPath,
    wakeWordPath,
  });

    detector.setThreshold(0.5);

  console.log("[WakeWord] Detector initialized successfully");

  return detector;
}

export function processWakeWordFrame(
  detector: WakeWordDetector,
  audioBuffer: ArrayBuffer
): boolean {
  const result = detector.processFrame(audioBuffer);

  if (result.isDetected) {
    console.log(
      "[WakeWord] Hey Jarvis detected!",
      result.probability
    );

    return true;
  }

  return false;
}