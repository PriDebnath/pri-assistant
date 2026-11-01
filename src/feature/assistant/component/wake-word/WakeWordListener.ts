
import { AudioManager, AudioRecorder } from "react-native-audio-api";
import {
  initializeWakeWord,
  processWakeWordFrame,
} from "./WakeWordDetector";

const SAMPLE_RATE = 16_000;
const FRAME_SIZE = 1_280;

export async function startWakeWordListening(
  onDetected: (probability: number) => void
): Promise<() => Promise<void>> {
  console.log("[WakeWord] Initializing...");

  const permission = await AudioManager.requestRecordingPermissions();

  if (permission !== "Granted") {
    throw new Error("Microphone permission was not granted");
  }

  const detector = await initializeWakeWord();
  const recorder = new AudioRecorder();

  let stopped = false;
  let offset = 0;
  let frameCount = 0;
  let wasDetected = false;

  const samples = new Int16Array(FRAME_SIZE);

  recorder.onError((error) => {
    console.error("[WakeWord] Recorder error:", error);
  });

  recorder.onAudioReady(
    {
      sampleRate: SAMPLE_RATE,
      bufferLength: FRAME_SIZE,
      channelCount: 1,
    },
    ({ buffer, numFrames }) => {
      if (stopped) return;

      frameCount++;

      if (buffer.sampleRate !== SAMPLE_RATE) {
        console.warn(
          "[WakeWord] Unexpected sample rate:",
          buffer.sampleRate
        );
        return;
      }

      const channels = Array.from(
        { length: buffer.numberOfChannels },
        (_, index) => buffer.getChannelData(index)
      );

      if (channels.length === 0) return;

      const count = Math.min(
        numFrames,
        ...channels.map((channel) => channel.length)
      );

      for (let i = 0; i < count; i++) {
        let sample = 0;

        for (const channel of channels) {
          sample += channel[i];
        }

        sample /= channels.length;
        sample = Math.max(-1, Math.min(1, sample));

        samples[offset++] = Math.round(
          sample < 0 ? sample * 32768 : sample * 32767
        );

        if (offset === FRAME_SIZE) {
          const result = processWakeWordFrame(
            detector,
            samples.slice().buffer
          );

          // IMPORTANT: processFrame returns an object.
          const detected = result.isDetected;
          const probability = result.probability;

          if (frameCount % 25 === 0) {
            console.log("[WakeWord] Probability:", probability.toFixed(6));
          }

          if (detected && !wasDetected) {
            console.log(
              "[WakeWord] DETECTED! Probability:",
              probability
            );
  wasDetected = true;
            onDetected(probability);
          }

          wasDetected = detected;
          offset = 0;
        }
      }
    }
  );

  try {
    console.log("[WakeWord] Activating audio session...");

    await AudioManager.setAudioSessionActivity(true);

    console.log("[WakeWord] Starting recorder...");

    await recorder.start();

    console.log("[WakeWord] Recorder started. Listening for Hey Jarvis.");

    return async () => {
      if (stopped) return;

      stopped = true;

      console.log("[WakeWord] Stopping...");

      try {
        recorder.clearOnAudioReady();
        await recorder.stop();
      } finally {
        detector.reset();
        await AudioManager.setAudioSessionActivity(false);
      }

      console.log("[WakeWord] Stopped.");
    };
  } catch (error) {
    stopped = true;

    try {
      recorder.clearOnAudioReady();
      await recorder.stop();
    } catch {
      // Recorder may not have started.
    } finally {
      detector.reset();
      await AudioManager.setAudioSessionActivity(false).catch(() => false);
    }

    console.error("[WakeWord] Startup failed:", error);
    throw error;
  }
}
