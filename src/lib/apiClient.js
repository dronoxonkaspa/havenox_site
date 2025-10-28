export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://havenox-backend.onrender.com";

/**
 * Generic request wrapper
 */
async function request(path, options = {}) {
  const { method = "GET", headers = {}, body } = options;
  const url = `${API_BASE}${path}`;
  const init = { method, headers: { ...headers } };

  if (body !== undefined && body !== null) {
    if (!init.headers["Content-Type"]) {
      init.headers["Content-Type"] = "application/json";
    }
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(url, init);
  const text = await response.text();

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON response from ${path}: ${err.message}`);
    }
  }

  if (!response.ok) {
    const message =
      data?.message || data?.error || `Request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// 📦 Marketplace
export function getListings() {
  return request("/marketplace/listings");
}

export function createListing(payload) {
  return request("/marketplace/listings", { method: "POST", body: payload });
}

// 🪙 NFT Mint
export function mintNft(payload) {
  return request("/mint-nft", { method: "POST", body: payload });
}

// 🎪 Tent / Live Trading
export function createTentSession(payload) {
  return request("/tent/create", { method: "POST", body: payload });
}

export function getTent(id) {
  return request(`/tent/${id}`);
}

// 💰 Escrows
export function getEscrows(wallet) {
  const query = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
  return request(`/escrows${query}`);
}

export function signEscrow(id, payload) {
  return request(`/escrows/${id}/sign`, { method: "POST", body: payload });
}

// 📜 Trade History
export function getTradeHistory(wallet) {
  const query = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
  return request(`/trade-history${query}`);
}

export function recordTrade(payload) {
  return request("/trade-history", { method: "POST", body: payload });
}

// 🔐 Wallet Verification
export function verifySession(payload) {
  return request("/verify", { method: "POST", body: payload });
}

// 🧬 Mint + Treasury Info
export function getMints(address) {
  const query = address ? `?address=${encodeURIComponent(address)}` : "";
  return request(`/mints${query}`);
}

export function getTreasuryConfig() {
  return request("/config/treasury");
}
