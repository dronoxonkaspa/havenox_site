// src/lib/apiClient.js — HavenOx API Client (Codex v1.3)
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

// 🧩 Tent Endpoints
export const getTent = async (id) => request(`/tent/${id}`);
export const createTentSession = async (payload) =>
  request("/tent/create", { method: "POST", body: payload });

// 🛒 Marketplace Endpoints
export const fetchListings = async () => request("/marketplace/listings");
export const postListing = async (data) =>
  request("/marketplace/listings", { method: "POST", body: data });

// 🪙 Session Verification
export const verifySession = async (data) =>
  request("/session/verify", { method: "POST", body: data });

// 🪙 Minting & Signature Verification
export const verifySignature = async (data) =>
  request("/verify", { method: "POST", body: data });

export const mintNft = async (payload) =>
  request("/mint-nft", { method: "POST", body: payload });

// 🤝 Escrow Endpoints
export const getEscrows = async (wallet) => {
  const url = wallet ? `/escrows?wallet=${wallet}` : "/escrows";
  return request(url);
};

export const signEscrow = async (id, data) =>
  request(`/escrows/${id}/sign`, { method: "POST", body: data });

// 📊 Trade History
export const getTradeHistory = async (wallet) => {
  const url = wallet ? `/trade-history?wallet=${wallet}` : "/trade-history";
  return request(url);
};

export const addTradeRecord = async (data) =>
  request("/trade-history", { method: "POST", body: data });

// ⚙️ Config
export const getTreasuryConfig = async () => request("/config/treasury");

export { request };
