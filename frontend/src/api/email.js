// src/api/email.js
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_KEY = import.meta.env.VITE_AUTHENTRACE_API_KEY || "authentrace_secret_key_2024";

export async function fetchEmails(limit = 50, offset = 0) {
  const res = await fetch(`${API_URL}/emails?limit=${limit}&offset=${offset}`, {
    headers: {
      "X-API-Key": API_KEY,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  const data = await res.json(); // backend: { success, emails: [...] }
  // Normalize to older client shape: { items: [...] }
  return {
    ...(data || {}),
    items: Array.isArray(data.emails) ? data.emails : [],
  };
}
