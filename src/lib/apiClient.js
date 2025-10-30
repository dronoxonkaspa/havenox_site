// src/lib/apiClient.js — HavenOx API Client (Codex v1.2)
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000";

async function request(path, options = {}) {
  const { method = "GET", headers = {}, body, signal } = options;
  const url = `${API_BASE}${path}`;

  const init = { method, headers: { ...headers } };
  if (signal) init.signal = signal;
  if (body !== undefined && body !== null) {
    if (!init.headers["Content-Type"])
      init.headers["Content-Type"] = "application/json";
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(url, init);
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON from ${path}: ${err.message}`);
    }
  }

  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// Tent + Marketplace helpers
export const getTent = async (id) => request(`/tent/${id}`);
export const createTentSession = async (payload) =>
  request("/tent/create", { method: "POST", body: payload });
export const fetchListings = async () => request("/marketplace/listings");
export const postListing = async (data) =>
  request("/marketplace/listings", { method: "POST", body: data });
export const verifySignature = async (data) =>
  request("/verify", { method: "POST", body: data });

export { request };
