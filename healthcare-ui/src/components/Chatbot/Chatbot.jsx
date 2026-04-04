import React, { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../SiteHeader";
import { useSpeech } from "../../hooks/useSpeech";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import {
  fetchNearbyHospitals as fetchNearbyHospitalsApi,
  fetchChatReply,
} from "../../services/api";
import ChatMessages from "./ChatMessages";
import InputBar from "./InputBar";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { isSpeaking, speakText } = useSpeech();

  const { startVoiceInput } = useVoiceInput(setInput);

  const findNearbyHospitals = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const data = await fetchNearbyHospitalsApi(lat, lng);

      const hospitalList = data.hospitals.map((hospital) => {
        if (!hospital.maps_link) {
          return hospital.name;
        }

        return `${hospital.name}
📍 Distance: ${hospital.distance} km
MAP_LINK:${hospital.maps_link}`;
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Nearby Hospitals:\n\n" + hospitalList.join("\n\n")
        }
      ]);
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    setLoading(true);

    try {
      const data = await fetchChatReply(input);

      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);

      if (data.confidence && data.confidence >= 20) {
        const confirmVisit = window.confirm(
          "Symptoms may indicate a health issue. Consult a doctor soon.\n\nFind nearby hospitals?"
        );

        if (confirmVisit) {
          findNearbyHospitals();
        }
      }
    } catch {
      setMessages((prev) => [...prev, { sender: "bot", text: "Server error occurred." }]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      <SiteHeader />

      <main className="relative px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle,_rgb(165_243_252)_1.5px,_transparent_1.5px)] bg-[length:18px_18px]"
          aria-hidden
        />

        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition hover:text-cyan-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/80 ring-1 ring-slate-100">
            <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/90 to-white px-5 py-5 sm:px-8 sm:py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">Live assistant</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Healthcare AI Assistant <span className="font-normal text-slate-600">🩺</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Chat about symptoms here. For lab reports or medicine photos, use{" "}
                <strong className="font-medium text-slate-800">Upload lab report</strong> or{" "}
                <strong className="font-medium text-slate-800">Upload medicine</strong> in the menu above.
                Use <strong className="font-medium text-slate-800">Find nearby hospital</strong> for maps.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              <ChatMessages
                messages={messages}
                loading={loading}
                isSpeaking={isSpeaking}
                speakText={speakText}
              />

              <InputBar
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                startVoiceInput={startVoiceInput}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
