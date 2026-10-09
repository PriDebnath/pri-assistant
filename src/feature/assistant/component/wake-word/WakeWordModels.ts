import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

const MODEL_DIRECTORY = `${FileSystem.documentDirectory}wakeword/`;

async function copyModel(
  assetModule: number,
  filename: string
): Promise<string> {
  const destination = `${MODEL_DIRECTORY}${filename}`;

  // Ensure the destination directory exists.
  await FileSystem.makeDirectoryAsync(MODEL_DIRECTORY, {
    intermediates: true,
  });

  // Resolve the bundled asset.
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error(
      `[WakeWord] Could not resolve bundled asset: ${filename}`
    );
  }

  // Inspect the existing destination.
  const existing = await FileSystem.getInfoAsync(destination);

  // Reuse only a nonempty existing file.
  if (existing.exists && existing.size && existing.size > 0) {
    console.log("[WakeWord] Using existing model:", {
      filename,
      size: existing.size,
      path: destination,
    });

    return destination;
  }

  // Remove an invalid or empty destination before copying.
  if (existing.exists) {
    await FileSystem.deleteAsync(destination, {
      idempotent: true,
    });
  }

  console.log("[WakeWord] Copying model:", {
    filename,
    source: asset.localUri,
    destination,
  });

  await FileSystem.copyAsync({
    from: asset.localUri,
    to: destination,
  });

  // Verify that the copied file exists and is nonempty.
  const copied = await FileSystem.getInfoAsync(destination);

  if (!copied.exists || !copied.size || copied.size <= 0) {
    throw new Error(
      `[WakeWord] Model copy failed or produced an empty file: ${filename}`
    );
  }

  console.log("[WakeWord] Model copied successfully:", {
    filename,
    size: copied.size,
    path: destination,
  });

  return destination;
}

export async function prepareWakeWordModels() {
  console.log("[WakeWord] Preparing models...");

  const melspectrogram = await copyModel(
    require("../../../../../assets/wakeword/melspectrogram.tflite"),
    "melspectrogram.tflite"
  );

  const embedding = await copyModel(
    require("../../../../../assets/wakeword/embedding_model.tflite"),
    "embedding_model.tflite"
  );

  const heyJarvis = await copyModel(
    require("../../../../../assets/wakeword/hey_jarvis_v0.1.tflite"),
    "hey_jarvis_v0.1.tflite"
  );

  console.log("[WakeWord] All model paths prepared:", {
    melspectrogram,
    embedding,
    heyJarvis,
  });

  return {
    melspectrogram,
    embedding,
    heyJarvis,
  };
}
