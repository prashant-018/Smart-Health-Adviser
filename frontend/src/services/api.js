// ── API Base URL ──────────────────────────────────────────────────────────────
// Set REACT_APP_API_BASE_URL in your Vercel project settings (Environment Variables):
//   REACT_APP_API_BASE_URL = https://smart-health-adviser-1.onrender.com
//
// For local development, create frontend/.env with:
//   REACT_APP_API_BASE_URL=http://127.0.0.1:5000
//
// IMPORTANT: REACT_APP_* vars are baked in at build time by Create React App.
//            Changes only take effect after a new build/deploy.
const RAW_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";
const BASE = String(RAW_BASE).replace(/\/+$/, ""); // strip trailing slash

// Shared fetch options — credentials:"include" is REQUIRED when Flask uses
// supports_credentials=True, otherwise the browser blocks the CORS response.
const SHARED_OPTS = {
  credentials: "include",
};

/** Merge phone / Phone / phones[] from API into a single display string */
export function normalizeNearbyHospital(h) {
  if (!h || typeof h !== "object") return h;
  const raw =
    h.phone ?? h.Phone ?? (Array.isArray(h.phones) ? h.phones.filter(Boolean).join("; ") : "");
  const phone = typeof raw === "string" ? raw.trim() : String(raw || "").trim();
  return { ...h, phone };
}

export async function fetchNearbyHospitals(lat, lng) {
  const response = await fetch(
    `${BASE}/nearby_hospitals?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
    { ...SHARED_OPTS, cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error(`nearby_hospitals failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchChatReply(message) {
  const response = await fetch(`${BASE}/chat`, {
    ...SHARED_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    throw new Error(`/chat failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function postMedicineImage(formData) {
  const response = await fetch(`${BASE}/upload_medicine_image`, {
    ...SHARED_OPTS,
    method: "POST",
    body: formData,               // ← NO Content-Type header: browser sets multipart boundary
  });
  if (!response.ok) {
    throw new Error(`/upload_medicine_image failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function postLabReport(formData) {
  const response = await fetch(`${BASE}/upload_lab_report`, {
    ...SHARED_OPTS,
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`/upload_lab_report failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function postSkinImage(formData) {
  const response = await fetch(`${BASE}/detect_skin_disease`, {
    ...SHARED_OPTS,
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`/detect_skin_disease failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

