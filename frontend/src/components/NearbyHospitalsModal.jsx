import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fetchNearbyHospitals, normalizeNearbyHospital } from "../services/api";

function MapPinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

/** First number in a string like "011-123; 456" for tel: href */
function phoneDialHref(phone) {
  if (!phone || typeof phone !== "string") return null;
  const first = phone.split(";")[0].trim();
  const digits = first.replace(/[^\d+]/g, "");
  return digits.length >= 5 ? `tel:${digits}` : null;
}

export default function NearbyHospitalsModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const fetchGenerationRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    const generation = ++fetchGenerationRef.current;

    const run = () => {
      setLoading(true);
      setError(null);
      setHospitals([]);

      if (!navigator.geolocation) {
        setError("Geolocation is not supported in this browser.");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (generation !== fetchGenerationRef.current) return;
          try {
            const data = await fetchNearbyHospitals(
              position.coords.latitude,
              position.coords.longitude
            );
            if (generation !== fetchGenerationRef.current) return;
            const raw = Array.isArray(data.hospitals) ? data.hospitals : [];
            setHospitals(raw.map(normalizeNearbyHospital));
          } catch {
            if (generation === fetchGenerationRef.current) {
              setError("Could not reach the server. Check that the API is running.");
            }
          } finally {
            if (generation === fetchGenerationRef.current) setLoading(false);
          }
        },
        () => {
          if (generation === fetchGenerationRef.current) {
            setError("Location permission is needed to find hospitals near you.");
            setLoading(false);
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
      );
    };

    run();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nearby-hospitals-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[min(85vh,calc(100dvh-1.5rem))] w-full max-w-lg min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 sm:max-h-[min(80vh,calc(100dvh-2rem))]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-cyan-50/90 to-white px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-2">
            <h2 id="nearby-hospitals-title" className="text-lg font-bold tracking-tight text-slate-900">
              Nearby hospitals
            </h2>
            <p className="mt-1 text-sm leading-snug text-slate-600">
              Based on your location · within ~15 km
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-4 sm:px-6">
          {loading ? (
            <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 text-slate-600">
              <svg className="h-10 w-10 animate-spin text-cyan-500" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm font-medium">Getting your location…</p>
            </div>
          ) : null}

          {error && !loading ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
              {error}
            </div>
          ) : null}

          {!loading && !error && hospitals.length > 0 ? (
            <ul className="flex flex-col gap-3 pb-1">
              {hospitals.map((h, i) => (
                <li
                  key={`${h.name}-${i}`}
                  className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <p className="text-base font-semibold leading-snug text-slate-900">{h.name}</p>
                  {h.distance !== "" && h.distance != null ? (
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1 text-rose-600">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-rose-500" />
                        <span>
                          {h.distance} km away
                          {h.rating && h.rating !== "N/A" ? ` · Rating: ${h.rating}` : ""}
                        </span>
                      </span>
                    </p>
                  ) : null}
                  {h.phone ? (
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-medium text-slate-800">Phone: </span>
                      {phoneDialHref(h.phone) ? (
                        <a
                          href={phoneDialHref(h.phone)}
                          className="font-medium text-cyan-600 underline-offset-2 hover:text-cyan-700 hover:underline"
                        >
                          {h.phone}
                        </a>
                      ) : (
                        <span>{h.phone}</span>
                      )}
                    </p>
                  ) : null}
                  {h.maps_link ? (
                    <a
                      href={h.maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 underline-offset-2 hover:text-cyan-700 hover:underline"
                    >
                      Open in Google Maps
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {!loading && !error && hospitals.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-600">No hospitals returned.</p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/90 px-5 py-3 sm:px-6">
          <p className="text-center text-xs leading-relaxed text-slate-500">
            For life-threatening emergencies, contact your local emergency number immediately.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
