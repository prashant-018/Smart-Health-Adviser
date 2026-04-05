import React from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      <SiteHeader />

      <main className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle,_rgb(165_243_252)_1.5px,_transparent_1.5px)] bg-[length:20px_20px]"
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
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">About</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Healthcare AI Assistant
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                A simple digital front door for everyday health questions—symptom guidance, lab and medicine
                uploads, and nearby hospital search.
              </p>
            </div>

            <div className="space-y-6 px-6 py-8 text-sm leading-relaxed text-slate-700 sm:px-10 sm:py-10">
              <section>
                <h2 className="text-base font-semibold text-slate-900">What it does</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                  <li>Chat about symptoms to see possible conditions and general precautions (not a diagnosis).</li>
                  <li>Upload lab reports or medicine photos for plain-language summaries.</li>
                  <li>Use Find nearby hospital to explore facilities around your location.</li>
                </ul>
              </section>

              <section className="rounded-xl border border-amber-100 bg-amber-50/80 p-4 text-amber-950">
                <h2 className="text-base font-semibold text-amber-900">Important</h2>
                <p className="mt-2 text-slate-700">
                  This tool is for education and support only. It does not replace advice, diagnosis, or treatment
                  from a qualified clinician. In an emergency, contact local emergency services immediately.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
