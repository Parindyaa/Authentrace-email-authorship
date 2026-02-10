// src/api/verify.js
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_KEY = import.meta.env.VITE_AUTHENTRACE_API_KEY || "authentrace_secret_key_2024";

export async function verifyEmail(payload) {
  const res = await fetch(`${API_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  const data = await res.json();
  // backend returns { success: true, result: {...} }
  return data.result;
}
