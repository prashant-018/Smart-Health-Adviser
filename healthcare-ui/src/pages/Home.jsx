import React from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";

function BrushUnderline({ children, color = "teal" }) {
  const bg =
    color === "pink"
      ? "bg-pink-200/90"
      : "bg-cyan-200/90";
  return (
    <span className="relative inline-block px-0.5">
      <span className="relative z-10">{children}</span>
      <span
        className={`pointer-events-none absolute inset-x-0 bottom-0.5 -z-0 h-2.5 rounded-full ${bg} -skew-y-1`}
        aria-hidden
      />
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="order-2 lg:order-1">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                Get best <BrushUnderline>quality health</BrushUnderline>{" "}
                <BrushUnderline color="pink">care</BrushUnderline> services{" "}
                <BrushUnderline>at reasonable cost</BrushUnderline>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                <strong className="font-semibold text-slate-800">Healthcare AI Assistant</strong> is your
                digital front door for everyday health questions. Describe how you feel in plain language,
                get organized guidance, and see when it makes sense to speak with a clinician — all in one
                place.
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
                Upload a lab report or a photo of your medicine for quick summaries in everyday words, and
                use <strong className="font-medium text-slate-700">Find nearby hospital</strong> in the
                header to locate facilities near you. This tool supports better decisions; it does not
                replace diagnosis or treatment from a licensed professional.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/chat"
                  className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-600"
                >
                  Start health chat
                </Link>
                <Link
                  to="/upload-lab-report"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/50"
                >
                  Upload lab report
                </Link>
              </div>
              <ul className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
                {[
                  "Symptom chat & guidance",
                  "Lab & medicine uploads",
                  "Hospitals near you",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative order-1 flex justify-center lg:order-2 lg:justify-end">
              <div
                className="pointer-events-none absolute inset-0 -right-8 -z-10 opacity-40 bg-[radial-gradient(circle,_rgb(165_243_252)_1.5px,_transparent_1.5px)] bg-[length:18px_18px]"
                aria-hidden
              />
              <div className="pointer-events-none absolute -right-4 top-8 hidden text-cyan-400/80 sm:block" aria-hidden>
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="relative w-full max-w-md">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80"
                  alt="Healthcare professionals"
                  className="relative z-10 w-full rounded-2xl object-cover shadow-xl ring-1 ring-slate-200/60"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
