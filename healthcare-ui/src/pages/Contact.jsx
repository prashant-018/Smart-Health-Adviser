import React, { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
              <p className="text-xs font-semibold uppercase tracking-wider text-pink-600">Contact</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Contact us</h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                Questions or feedback about this demo app? Send a message below or reach out by email.
              </p>
            </div>

            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-sm text-slate-600">
                Email:{" "}
                <a href="mailto:support@example.com" className="font-medium text-cyan-600 hover:text-cyan-700">
                  support@example.com
                </a>
                <span className="text-slate-400"> (replace with your address)</span>
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-600 sm:w-auto"
                >
                  Send message
                </button>
              </form>

              {submitted ? (
                <p className="mt-4 text-sm text-slate-600" role="status">
                  Thanks—this demo doesn’t send messages yet. Wire this form to your backend or email service when
                  you’re ready.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
