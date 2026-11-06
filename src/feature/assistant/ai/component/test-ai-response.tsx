import { useState } from "react";
import { Alert, Button } from "react-native";

import { downloadModel, importModel } from "@/feature/assistant/ai/model-download.service";
import { generateResponse } from "@/feature/assistant/ai/model-inference.service";

export default function ModelTest() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    try {
      setLoading(true);

      await downloadModel(setProgress);
//  let i = await importModel() 
// console.log({i});

      const response = await generateResponse(
        "Reply exactly: Pri Assistant is working."
      );
      console.log("AI RESPONSE:", JSON.stringify(response, null, 2));
// console.log("GENERATED TEXT:", response.text);

      Alert.alert("AI Response", response);
    } catch (error) {
      Alert.alert(
        "Model Error",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title={
        loading
          ? `Downloading / Loading: ${progress}%`
          : "Download and Test AI Model"
      }
      // disabled={loading}
      onPress={handleTest}
    />
  );
}