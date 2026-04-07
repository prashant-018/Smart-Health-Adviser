import React, { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { postMedicineImage } from "../services/api";

export default function UploadMedicinePage() {
  const fileRef = useRef(null);
  const [reply, setReply] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const syncFileFromInput = useCallback(() => {
    const f = fileRef.current?.files?.[0];
    setFileName(f ? f.name : "");
  }, []);

  const uploadMedicineImage = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || loading) return;

    setLoading(true);
    setReply("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const data = await postMedicineImage(formData);
      setReply(data.reply || "");
    } catch {
      setReply("Something went wrong. Check that the API is running and try again.");
    } finally {
      setLoading(false);
    }
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
      syncFileFromInput();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      <SiteHeader />

      <main className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(circle,_rgb(251_207_232)_1.5px,_transparent_1.5px)] bg-[length:20px_20px]"
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
            <div className="border-b border-slate-100 bg-gradient-to-r from-pink-50/80 to-white px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-pink-600">Medicines</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Upload medicine photo
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                Take or upload a clear photo of the packaging or label. The assistant will try to
                identify the medicine and share usage-oriented details.
              </p>
            </div>

            <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={syncFileFromInput}
              />

              <button
                type="button"
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`group relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition ${
                  dragActive
                    ? "border-pink-500 bg-pink-50/80"
                    : "border-slate-200 bg-slate-50/50 hover:border-pink-300 hover:bg-pink-50/40"
                }`}
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-600 text-white shadow-lg shadow-pink-500/25 transition group-hover:scale-105">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <span className="text-center text-sm font-semibold text-slate-800">
                  {fileName ? fileName : "Drop an image here, or click to browse"}
                </span>
                <span className="mt-2 text-center text-xs text-slate-500">JPG, PNG, WEBP — keep the label readable</span>
              </button>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  disabled={!fileName || loading}
                  onClick={uploadMedicineImage}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Identifying…
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload &amp; identify
                    </>
                  )}
                </button>
              </div>

              {reply ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 ring-1 ring-slate-100">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-600">Result</p>
                  <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{reply}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
