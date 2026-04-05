import { useRef } from "react";

export function useVoiceInput(setInput) {
  const recognitionRef = useRef(null);

  const startVoiceInput = () => {

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
  };

  recognition.onerror = () => {
    alert("Voice recognition failed");
  };

  recognitionRef.current = recognition;
};

  return {
    recognitionRef,
    startVoiceInput
  };
}
