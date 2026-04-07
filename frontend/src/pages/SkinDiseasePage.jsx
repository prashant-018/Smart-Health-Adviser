import React, { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { postSkinImage } from "../services/api";

export default function SkinDiseasePage() {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const syncFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const onInputChange = () => {
    const f = fileRef.current?.files?.[0];
    if (f) syncFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
    }
    syncFile(file);
  };

  const analyze = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || loading) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const data = await postSkinImage(formData);
      if (data.error) setError(data.error);
      else setResult(data);
    } catch {
      setError("Something went wrong. Make sure the API server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      <SiteHeader />

      <main className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle,_rgb(187_247_208)_1.5px,_transparent_1.5px)] bg-[length:20px_20px]"
          aria-hidden
        />

        <div className="mx-auto max-w-2xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition hover:text-cyan-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/80 ring-1 ring-slate-100">
            {/* Header */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-green-50/80 to-white px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Skin AI</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Skin Disease Detector
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                Upload a clear photo of the affected skin area (rash, acne, mole, etc.) and the AI
                will suggest a possible condition with care tips.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                ⚠️ For informational purposes only — not a medical diagnosis. Always consult a dermatologist.
              </p>
            </div>

            <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onInputChange}
              />

              {/* Drop zone */}
              <button
                type="button"
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`group relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
                  dragActive
                    ? "border-green-500 bg-green-50/80"
                    : "border-slate-200 bg-slate-50/50 hover:border-green-300 hover:bg-green-50/40"
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mb-3 h-40 w-40 rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-500/25 transition group-hover:scale-105">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                )}
                <span className="text-center text-sm font-semibold text-slate-800">
                  {fileName || "Drop a skin photo here, or click to browse"}
                </span>
                <span className="mt-1 text-center text-xs text-slate-500">JPG, PNG, WEBP — clear, well-lit photo works best</span>
              </button>

              {/* Analyze button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!fileName || loading}
                  onClick={analyze}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze Skin
                    </>
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 ring-1 ring-slate-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{result.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Detection Result</p>
                      <p className="text-lg font-bold text-slate-900">{result.condition}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">Care Suggestions:</p>
                    <ul className="space-y-1.5">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-0.5 text-green-500">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {result.reason && (
                    <p className="text-xs text-slate-400 italic">Analysis basis: {result.reason}</p>
                  )}

                  {result.features && (
                    <details className="text-xs text-slate-400">
                      <summary className="cursor-pointer hover:text-slate-600">Show analysis details</summary>
                      <ul className="mt-2 space-y-0.5 pl-2">
                        {Object.entries(result.features).map(([k, v]) => (
                          <li key={k}>{k.replace(/_/g, " ")}: {v}</li>
                        ))}
                      </ul>
                    </details>
                  )}

                  <p className="text-xs text-slate-400 border-t border-slate-200 pt-3">
                    This is an AI-assisted suggestion only. Please consult a qualified dermatologist for diagnosis and treatment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
