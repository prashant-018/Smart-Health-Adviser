// Call Flask directly. The simple "proxy" field in package.json often does not forward these
// POST routes (404 + HTML body → JSON parse error). Flask CORS allows http://localhost:3000.
const RAW_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";
const BASE = String(RAW_BASE).replace(/\/+$/, "");

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
    { cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error(`nearby_hospitals failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchChatReply(message) {
  const response = await fetch(
    `${BASE}/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    }
  );
  return response.json();
}

export async function postMedicineImage(formData) {
  const response = await fetch(
    `${BASE}/upload_medicine_image`,
    {
      method: "POST",
      body: formData
    }
  );
  return response.json();
}

export async function postLabReport(formData) {
  const response = await fetch(
    `${BASE}/upload_lab_report`,
    {
      method: "POST",
      body: formData
    }
  );
  return response.json();
}

export async function postSkinImage(formData) {
  const response = await fetch(
    `${BASE}/detect_skin_disease`,
    {
      method: "POST",
      body: formData
    }
  );
  return response.json();
}
