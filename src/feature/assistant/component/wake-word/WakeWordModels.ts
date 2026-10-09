import { Asset } from "expo-asset";
// import * as FileSystem from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
const MODEL_DIRECTORY =
  `${FileSystem.documentDirectory}wakeword/`;

async function copyModel(
  assetModule: number,
  filename: string
) {
  const asset = Asset.fromModule(assetModule);

  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error(
      `Could not load wake-word asset: ${filename}`
    );
  }

  const directoryInfo =
    await FileSystem.getInfoAsync(
      MODEL_DIRECTORY
    );

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      MODEL_DIRECTORY,
      {
        intermediates: true,
      }
    );
  }

  const destination =
    `${MODEL_DIRECTORY}${filename}`;

  const existing =
    await FileSystem.getInfoAsync(
      destination
    );

  if (!existing.exists) {
    await FileSystem.copyAsync({
      from: asset.localUri,
      to: destination,
    });
  }

  return destination;
}

export async function prepareWakeWordModels() {
  const melspectrogram =
    await copyModel(
      require(
        "../../../../../assets/wakeword/melspectrogram.tflite"
        // "../../../assets/wakeword/melspectrogram.tflite"
        // "../../../../../assets/wakeword/melspectrogram.tflite"
      ),
      "melspectrogram.tflite"
    );

  const embedding =
    await copyModel(
      require(
        // "../../../assets/wakeword/embedding_model.tflite"
        "../../../../../assets/wakeword/embedding_model.tflite"
      ),
      "embedding_model.tflite"
    );

  const heyJarvis =
    await copyModel(
      require(
        // "../../../assets/wakeword/hey_jarvis_v0.1.tflite"
        "../../../../../assets/wakeword/hey_jarvis_v0.1.tflite"
      ),
      "hey_jarvis_v0.1.tflite"
    );

  return {
    melspectrogram,
    embedding,
    heyJarvis,
  };
}