import { Openwakeword } from "react-native-openwakeword";
import { prepareWakeWordModels } from "./WakeWordModels";

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

  console.log("[WakeWord] Detector initialized successfully");

  return detector;
}