
import { AudioManager, AudioRecorder ,} from "react-native-audio-api";
import {
  initializeWakeWord,
  processWakeWordFrame,
} from "./WakeWordDetector";

const SAMPLE_RATE = 16_000;
const FRAME_SIZE = 1_280;

export async function startWakeWordListening(
  onDetected: (probability: number) => void
// ){
): Promise<() => Promise<void>> {
    console.log('starttt');
    console.log(JSON.stringify(AudioManager,null,2));
    
  const permission = await AudioManager.requestRecordingPermissions();
console.log({permission});
  if (permission !== "Granted") {
    throw new Error("Microphone permission was not granted");
  }

  const detector = await initializeWakeWord();

  const recorder = new AudioRecorder(
  //   {
  //   sampleRate: SAMPLE_RATE,
  //   bufferLengthInSamples: FRAME_SIZE,
  // }
);

  let stopped = false;
  let offset = 0;
  let wasDetected = false;
  const samples = new Int16Array(FRAME_SIZE);

  recorder.onAudioReady({
sampleRate: SAMPLE_RATE,
    // bufferLengthInSamples: FRAME_SIZE,
    bufferLength: FRAME_SIZE,
    channelCount: 1,
  }
  ,
  ({ buffer, numFrames }) => {
    if (stopped) return;

    if (buffer.sampleRate !== SAMPLE_RATE) {
      console.warn("Unexpected microphone sample rate:", buffer.sampleRate);
      return;
    }

    const channels = Array.from(
      { length: buffer.numberOfChannels },
      (_, index) => buffer.getChannelData(index)
    );

    const count = Math.min(
      numFrames,
      ...channels.map((channel) => channel.length)
    );

    for (let i = 0; i < count; i++) {
      let sample = 0;

      for (const channel of channels) {
        sample += channel[i] ?? 0;
      }

      sample /= channels.length;
      sample = Math.max(-1, Math.min(1, sample));

      samples[offset++] = Math.round(
        sample < 0 ? sample * 32768 : sample * 32767
      );

      if (offset === FRAME_SIZE) {
        const resultDetected = processWakeWordFrame(
          detector,
          samples.slice().buffer
        );

        if (resultDetected && !wasDetected) {
          onDetected(1);
        }

        wasDetected = resultDetected;
        offset = 0;
      }
    }
  });

  try {
    await AudioManager.setAudioSessionActivity(true);
    recorder.start();
    try {
  console.log("[WakeWord] Activating audio session...");

  await AudioManager.setAudioSessionActivity(true);

  console.log("[WakeWord] Audio session activated");
  console.log("[WakeWord] Starting recorder...");

  recorder.start();

  console.log("[WakeWord] Recorder started");
} catch (error) {
  console.error("[WakeWord] Startup failed:", error);
  throw error;
}

    console.log("[WakeWord] Listening for Hey Jarvis");

    return async () => {
      if (stopped) return;
      stopped = true;

      try {
        recorder.stop();
      } finally {
        // recorder.disconnect();
        // recorder.clearOnAudioReady();
        detector.reset();
        await AudioManager.setAudioSessionActivity(false);
      }
    };
  } catch (error) {
    stopped = true;

    try {
      recorder.stop();
      recorder.clearOnAudioReady();
      detector.reset();
    } finally {
      await AudioManager.setAudioSessionActivity(false).catch(() => false);
    }

    throw error;
  }
}
