// Call Flask directly. The simple "proxy" field in package.json often does not forward these
// POST routes (404 + HTML body → JSON parse error). Flask CORS allows http://localhost:3000.
const BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

export async function fetchNearbyHospitals(lat, lng) {
  const response = await fetch(
    `${BASE}/nearby_hospitals?lat=${lat}&lng=${lng}`
  );
  return response.json();
}

export async function fetchChatReply(message) {
  const response = await fetch(
    `${BASE}/chat`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
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
