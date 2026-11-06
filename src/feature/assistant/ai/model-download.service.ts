
import {
  Directory,
  File,
  Paths,
} from "expo-file-system";

import * as DocumentPicker from "expo-document-picker";
 
import { MODEL_CONFIG } from "./model.config";

const MODEL_DIRECTORY = new Directory(
  Paths.document,
  "models",
  // '/sdcard/Android/data/com.pri.assistant/files/models'
);

console.log({MODEL_DIRECTORY});

let activeDownload:
  | ReturnType<typeof File.createDownloadTask>
  | null = null;

function getModelFile() {
  return new File(
    MODEL_DIRECTORY,
    MODEL_CONFIG.fileName,
  );
}

export function isModelDownloaded(): boolean {
  const file = getModelFile();
console.log({file});

  return (
    file.exists &&
    file.size !== null &&
    file.size >= MODEL_CONFIG.expectedSize * 0.95
  );
}

export function getDownloadedModelPath(): string | null {
  if (!isModelDownloaded()) {
    return null;
  }

  return getModelFile().uri;
}

export async function downloadModel(
  onProgress?: (progress: number) => void,
): Promise<string> {
  if (activeDownload) {
    throw new Error("Model download is already running.");
  }

  if (isModelDownloaded()) {
    return getModelFile().uri;
  }

  MODEL_DIRECTORY.create({
    idempotent: true,
    intermediates: true,
  });

  const modelFile = getModelFile();

  // Remove incomplete previous download.
  if (modelFile.exists) {
    modelFile.delete();
  }

  const task = File.createDownloadTask(
    MODEL_CONFIG.downloadUrl,
    modelFile,
    {
      onProgress: ({ bytesWritten, totalBytes }) => {
        if (totalBytes > 0) {
          const progress = Math.min(
            100,
            Math.round(
              (bytesWritten / totalBytes) * 100,
            ),
          );

          onProgress?.(progress);
        }
      },
    },
  );

  activeDownload = task;

  try {
    const downloadedFile = await task.downloadAsync();

    if (!downloadedFile) {
      throw new Error("Model download was interrupted.");
    }

    if (
      downloadedFile.size === null ||
      downloadedFile.size < MODEL_CONFIG.expectedSize * 0.95
    ) {
      throw new Error("Downloaded model file is incomplete.");
    }

    onProgress?.(100);

    return downloadedFile.uri;
  } catch (error) {
    if (modelFile.exists) {
      modelFile.delete();
    }

    throw error;
  } finally {
    activeDownload = null;
    task.release();
  }
}

export function cancelModelDownload(): void {
  activeDownload?.cancel();
}

export async function importModel() {
  try {
    // Create model directory
    MODEL_DIRECTORY.create({
      intermediates: true,
      idempotent: true,
    });

    // Select GGUF model
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      console.log("Model selection cancelled");
      return;
    }

    const asset = result.assets[0];

    console.log("Selected model:", asset.name);
    console.log("Selected URI:", asset.uri);
    console.log("Selected size:", asset.size);

    const source = new File(asset.uri);

    const destination = new File(
      MODEL_DIRECTORY,
      "qwen3-0.6b.gguf"
    );

    // Remove previous incomplete model
    if (destination.exists) {
      destination.delete();
    }

    // Copy model and wait for completion
    await source.copy(destination);

    // Verify
    console.log("Model copied:", destination.exists);
    console.log("Model size:", destination.size);
    console.log("Model path:", destination.uri);

    if (!destination.exists || destination.size !== 522640096) {
      throw new Error(
        `Model copy verification failed. Size: ${destination.size}`
      );
    }

    console.log("QWEN3 MODEL IMPORT SUCCESSFUL");

    return destination.uri;

  } catch (error) {
    console.error("Model import failed:", error);
    throw error;
  }
}