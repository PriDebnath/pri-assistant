import {
  Openwakeword,
} from "react-native-openwakeword";

import {
  prepareWakeWordModels,
} from "./WakeWordModels";

let detector:
  Awaited<
    ReturnType<
      typeof Openwakeword.createDetector
    >
  > | null = null;

export async function initializeWakeWord() {
  if (detector) {
    return detector;
  }

  console.log(
    "[WakeWord] Preparing models..."
  );

  const models =
    await prepareWakeWordModels();

  console.log(
    "[WakeWord] Model paths:",
    models
  );

  detector =
    await Openwakeword.createDetector({
      melspecPath:
        models.melspectrogram,

      embeddingPath:
        models.embedding,

      wakeWordPath:
        models.heyJarvis,
    });

  detector.setThreshold(0.5);

  console.log(
    "[WakeWord] Detector initialized"
  );

  return detector;
}

export function processWakeWordFrame(
  buffer: ArrayBuffer
) {
  if (!detector) {
    throw new Error(
      "Wake-word detector has not been initialized"
    );
  }

  return detector.processFrame(
    buffer
  );
}

export function resetWakeWord() {
  detector?.reset();
}

export function destroyWakeWord() {
  detector = null;
}