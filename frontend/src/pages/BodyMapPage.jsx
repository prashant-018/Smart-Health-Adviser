import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { fetchChatReply } from "../services/api";

// Body part to symptoms mapping
const BODY_PARTS = {
  head: {
    label: "Head",
    symptoms: ["headache", "dizziness", "blurred vision", "neck stiffness", "loss of smell"],
    position: { top: "5%", left: "50%", transform: "translateX(-50%)" },
  },
  eyes: {
    label: "Eyes",
    symptoms: ["blurred vision", "redness of eyes", "watering from eyes", "yellow eyes"],
    position: { top: "12%", left: "35%", transform: "translateX(-50%)" },
  },
  nose: {
    label: "Nose/Throat",
    symptoms: ["runny nose", "congestion", "sinus pressure", "sore throat", "throat irritation"],
    position: { top: "12%", left: "65%", transform: "translateX(-50%)" },
  },
  chest: {
    label: "Chest",
    symptoms: ["chest pain", "shortness of breath", "cough", "phlegm", "fast heart rate"],
    position: { top: "28%", left: "50%", transform: "translateX(-50%)" },
  },
  stomach: {
    label: "Stomach",
    symptoms: ["abdominal pain", "nausea", "vomiting", "loss of appetite", "indigestion"],
    position: { top: "42%", left: "50%", transform: "translateX(-50%)" },
  },
  back: {
    label: "Back",
    symptoms: ["back pain", "muscle pain", "stiffness"],
    position: { top: "32%", left: "15%", transform: "translateX(-50%)" },
  },
  leftArm: {
    label: "Left Arm",
    symptoms: ["joint pain", "muscle pain", "weakness", "swelling", "numbness"],
    position: { top: "32%", left: "85%", transform: "translateX(-50%)" },
  },
  rightArm: {
    label: "Right Arm",
    symptoms: ["joint pain", "muscle pain", "weakness", "swelling", "numbness"],
    position: { top: "38%", left: "85%", transform: "translateX(-50%)" },
  },
  legs: {
    label: "Legs",
    symptoms: ["joint pain", "muscle pain", "swelling", "weakness", "cramps"],
    position: { top: "70%", left: "50%", transform: "translateX(-50%)" },
  },
  skin: {
    label: "Skin (All)",
    symptoms: ["rash", "itching", "skin rash", "red spots", "acne", "pus filled pimples"],
    position: { top: "85%", left: "50%", transform: "translateX(-50%)" },
  },
};

const GENERAL_SYMPTOMS = [
  "fever", "high fever", "chills", "fatigue", "weakness", "sweating",
  "body ache", "loss of appetite", "weight loss", "dehydration"
];

export default function BodyMapPage() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [intensity, setIntensity] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handlePartClick = (partKey) => {
    setSelectedPart(partKey);
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptom)) {
        const newIntensity = { ...intensity };
        delete newIntensity[symptom];
        setIntensity(newIntensity);
        return prev.filter((s) => s !== symptom);
      }
      return [...prev, symptom];
    });
  };

  const handleIntensityChange = (symptom, value) => {
    setIntensity((prev) => ({ ...prev, [symptom]: value }));
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      alert("Please select at least one symptom");
      return;
    }

    setLoading(true);
    setResult(null);

    // Build symptom description with intensity
    const symptomText = selectedSymptoms
      .map((s) => {
        const level = intensity[s];
        if (level === "severe") return `severe ${s}`;
        if (level === "moderate") return `moderate ${s}`;
        return s;
      })
      .join(", ");

    try {
      const data = await fetchChatReply(`I have ${symptomText}`);
      setResult(data);
    } catch (error) {
      setResult({ reply: "Error analyzing symptoms. Please try again.", confidence: 0 });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedPart(null);
    setSelectedSymptoms([]);
    setIntensity({});
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      <SiteHeader />

      <main className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle,_rgb(251_191_36)_1.5px,_transparent_1.5px)] bg-[length:20px_20px]"
          aria-hidden
        />

        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition hover:text-cyan-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Interactive Diagnosis</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Body Map Symptom Checker 
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Click on body parts to select symptoms, adjust intensity, and get AI-powered health insights.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Body Map */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/80 ring-1 ring-slate-100">
              <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-white px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">Select Affected Area</h2>
                <p className="mt-1 text-xs text-slate-500">Click on body parts to see related symptoms</p>
              </div>

              <div className="p-6">
                {/* Improved Body Diagram */}
                <div className="relative mx-auto h-[550px] w-full max-w-[350px] rounded-2xl bg-gradient-to-b from-blue-50 to-slate-50 shadow-inner">
                  {/* Cleaner Body outline SVG */}
                  <svg
                    viewBox="0 0 200 450"
                    className="absolute inset-0 h-full w-full opacity-15"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Head */}
                    <ellipse cx="100" cy="30" rx="25" ry="28" fill="#64748b" />
                    {/* Neck */}
                    <rect x="92" y="55" width="16" height="12" fill="#64748b" />
                    {/* Shoulders */}
                    <ellipse cx="100" cy="75" rx="50" ry="15" fill="#64748b" />
                    {/* Torso */}
                    <rect x="70" y="75" width="60" height="90" rx="8" fill="#64748b" />
                    {/* Left Arm */}
                    <rect x="35" y="80" width="18" height="70" rx="9" fill="#64748b" />
                    {/* Right Arm */}
                    <rect x="147" y="80" width="18" height="70" rx="9" fill="#64748b" />
                    {/* Hips */}
                    <ellipse cx="100" cy="165" rx="35" ry="12" fill="#64748b" />
                    {/* Left Leg */}
                    <rect x="75" y="170" width="18" height="110" rx="9" fill="#64748b" />
                    {/* Right Leg */}
                    <rect x="107" y="170" width="18" height="110" rx="9" fill="#64748b" />
                  </svg>

                  {/* Clickable body parts with better spacing */}
                  {Object.entries(BODY_PARTS).map(([key, part]) => (
                    <button
                      key={key}
                      onClick={() => handlePartClick(key)}
                      style={part.position}
                      className={`absolute z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg transition-all hover:scale-110 ${
                        selectedPart === key
                          ? "bg-amber-500 text-white ring-2 ring-amber-600 ring-offset-2"
                          : "bg-white text-slate-700 hover:bg-amber-100 hover:shadow-xl"
                      }`}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>

                {/* General Symptoms */}
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-700">General Symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {GENERAL_SYMPTOMS.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition ${
                          selectedSymptoms.includes(symptom)
                            ? "bg-amber-500 text-white shadow-md"
                            : "bg-white text-slate-600 hover:bg-amber-100"
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Symptom Selection */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/80 ring-1 ring-slate-100">
              <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-white px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedPart ? BODY_PARTS[selectedPart].label : "Symptoms"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""} selected
                </p>
              </div>

              <div className="max-h-[500px] space-y-4 overflow-y-auto p-6">
                {selectedPart ? (
                  <>
                    {BODY_PARTS[selectedPart].symptoms.map((symptom) => (
                      <div
                        key={symptom}
                        className={`rounded-xl border p-4 transition ${
                          selectedSymptoms.includes(symptom)
                            ? "border-amber-300 bg-amber-50"
                            : "border-slate-200 bg-white hover:border-amber-200"
                        }`}
                      >
                        <label className="flex cursor-pointer items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{symptom}</span>
                          <input
                            type="checkbox"
                            checked={selectedSymptoms.includes(symptom)}
                            onChange={() => toggleSymptom(symptom)}
                            className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                          />
                        </label>

                        {selectedSymptoms.includes(symptom) && (
                          <div className="mt-3">
                            <p className="mb-2 text-xs text-slate-500">Intensity:</p>
                            <div className="flex gap-2">
                              {["mild", "moderate", "severe"].map((level) => (
                                <button
                                  key={level}
                                  onClick={() => handleIntensityChange(symptom, level)}
                                  className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
                                    intensity[symptom] === level
                                      ? "bg-amber-500 text-white"
                                      : "bg-slate-100 text-slate-600 hover:bg-amber-100"
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <svg
                      className="mx-auto mb-3 h-16 w-16 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="text-sm">Click on a body part to see symptoms</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    disabled={selectedSymptoms.length === 0}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={analyzeSymptoms}
                    disabled={selectedSymptoms.length === 0 || loading}
                    className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Analyzing..." : "Analyze Symptoms"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/80 ring-1 ring-slate-100">
              <div className="border-b border-slate-100 bg-gradient-to-r from-green-50/80 to-white px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">Analysis Result</h2>
              </div>
              <div className="p-6">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {result.reply}
                </div>
                {result.confidence >= 20 && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => navigate("/chat")}
                      className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
                    >
                      Continue in Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
