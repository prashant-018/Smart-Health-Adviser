import React, { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { postLabReport } from "../services/api";

export default function UploadLabReportPage() {
  const fileRef = useRef(null);
  const [reply, setReply] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const syncFileFromInput = useCallback(() => {
    const f = fileRef.current?.files?.[0];
    setFileName(f ? f.name : "");
  }, []);

  const uploadLabReport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || loading) return;

    setLoading(true);
    setReply("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await postLabReport(formData);
      setReply(data.reply || "");
    } catch (e) {
      setReply(e instanceof Error ? e.message : "Something went wrong. Please try again.");
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
          className="pointer-events-none absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(circle,_rgb(165_243_252)_1.5px,_transparent_1.5px)] bg-[length:20px_20px]"
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
            <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/80 to-white px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">Lab reports</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Upload your lab report
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                Add a PDF or image from your hospital or diagnostic center. Our assistant will read it
                and summarize the important results for you.
              </p>
            </div>

            <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,application/pdf,image/*"
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
                    ? "border-cyan-500 bg-cyan-50/80"
                    : "border-slate-200 bg-slate-50/50 hover:border-cyan-300 hover:bg-cyan-50/40"
                }`}
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 transition group-hover:scale-105">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </span>
                <span className="text-center text-sm font-semibold text-slate-800">
                  {fileName ? fileName : "Drop your file here, or click to browse"}
                </span>
                <span className="mt-2 text-center text-xs text-slate-500">PDF, PNG, JPG, WEBP up to typical lab sizes</span>
              </button>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  disabled={!fileName || loading}
                  onClick={uploadLabReport}
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
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload &amp; summarize
                    </>
                  )}
                </button>
              </div>

              {reply ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 ring-1 ring-slate-100">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-600">Summary</p>
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
