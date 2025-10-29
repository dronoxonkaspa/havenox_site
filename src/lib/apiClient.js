// src/lib/apiClient.js — HavenOx API Client (Codex v1.2)
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://havenox-backend.onrender.com";

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
    const message =
      data?.message || data?.error || `Request failed: ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ---------- Marketplace ----------
export const getListings = () => request("/marketplace/listings");
export const createListing = (payload) =>
  request("/marketplace/listings", { method: "POST", body: payload });

// ---------- Mint ----------
export const mintNft = (payload) =>
  request("/mint-nft", { method: "POST", body: payload });

// ---------- Tent / Live Trading ----------
export const createTentSession = (payload) =>
  request("/tent/create", { method: "POST", body: payload });
export const joinTentSession = (payload, { signal } = {}) =>
  request("/tent/join", { method: "POST", body: payload, signal });
export const completeTentSession = (payload) =>
  request("/tent/complete", { method: "POST", body: payload });
export const getTent = (id) => request(`/tent/${id}`);

// ---------- Escrows ----------
export const getEscrows = (wallet) => {
  const q = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
  return request(`/escrows${q}`);
};
export const signEscrow = (id, payload) =>
  request(`/escrows/${id}/sign`, { method: "POST", body: payload });

// ---------- Trade History ----------
export const getTradeHistory = (wallet) => {
  const q = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
  return request(`/trade-history${q}`);
};
export const recordTrade = (payload) =>
  request("/trade-history", { method: "POST", body: payload });

// ---------- Wallet / Auth ----------
export const verifySession = (payload) =>
  request("/verify", { method: "POST", body: payload });
export const verifySignature = (payload) =>
  request("/verify-signature", { method: "POST", body: payload });

// ---------- Mints ----------
export const getMints = (address) => {
  const q = address ? `?address=${encodeURIComponent(address)}` : "";
  return request(`/mints${q}`);
};
export const getTreasuryConfig = () => request("/config/treasury");
