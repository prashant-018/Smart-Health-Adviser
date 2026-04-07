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
        {/* Language Support Banner */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-center">
          <p className="text-sm font-medium text-white">
            🌐 Available in 10 languages: English, हिंदी, தமிழ், తెలుగు, বাংলা, मराठी, ગુજરાતી, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ
          </p>
        </div>

        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="order-2 lg:order-1">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                Get best <BrushUnderline>quality health</BrushUnderline>{" "}
                <BrushUnderline color="pink">care</BrushUnderline> services{" "}
                
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

            <div className="relative order-1 flex justify-center px-2 lg:order-2 lg:justify-end">
              <div
                className="pointer-events-none absolute inset-0 -right-8 -z-10 opacity-40 bg-[radial-gradient(circle,_rgb(165_243_252)_1.5px,_transparent_1.5px)] bg-[length:18px_18px]"
                aria-hidden
              />
              <div className="pointer-events-none absolute -right-4 top-8 hidden text-cyan-400/80 sm:block" aria-hidden>
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200/60 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80"
                  alt="Healthcare professionals"
                  className="relative z-10 w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Features</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Everything you need for better health</h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Body Map - Featured */}
              <Link
                to="/body-map"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg ring-1 ring-amber-200 transition hover:shadow-xl hover:ring-amber-300"
              >
                <div className="absolute right-4 top-4 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                  NEW
                </div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Body Map Checker 🧍</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Click on body parts to select symptoms visually. Adjust intensity and get instant AI diagnosis.
                </p>
                <div className="mt-4 flex items-center text-sm font-semibold text-amber-600 group-hover:text-amber-700">
                  Try it now
                  <svg className="ml-1 h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Chat */}
              <Link
                to="/chat"
                className="group rounded-2xl bg-slate-50 p-6 shadow-md ring-1 ring-slate-200 transition hover:shadow-lg hover:ring-cyan-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">AI Health Chat</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Describe symptoms in plain language and get instant health guidance with precautions.
                </p>
              </Link>

              {/* Skin Detector */}
              <Link
                to="/skin-detector"
                className="group rounded-2xl bg-slate-50 p-6 shadow-md ring-1 ring-slate-200 transition hover:shadow-lg hover:ring-green-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white shadow-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Skin Disease Detector</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Upload photos of rashes, acne, or skin conditions for AI-powered analysis and care tips.
                </p>
              </Link>

              {/* Lab Report */}
              <Link
                to="/upload-lab-report"
                className="group rounded-2xl bg-slate-50 p-6 shadow-md ring-1 ring-slate-200 transition hover:shadow-lg hover:ring-blue-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Lab Report Analyzer</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Upload blood test reports and get easy-to-understand summaries with health insights.
                </p>
              </Link>

              {/* Medicine */}
              <Link
                to="/upload-medicine"
                className="group rounded-2xl bg-slate-50 p-6 shadow-md ring-1 ring-slate-200 transition hover:shadow-lg hover:ring-pink-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-600 text-white shadow-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Medicine Identifier</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Take a photo of medicine packaging to identify it and learn about uses and side effects.
                </p>
              </Link>

              {/* Hospital Finder */}
              <div className="group rounded-2xl bg-slate-50 p-6 shadow-md ring-1 ring-slate-200">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Find Nearby Hospitals</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Locate hospitals near you with ratings, phone numbers, and directions. Available in the header.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
