import express from "express";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

const env = globalThis.process?.env ?? {};

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const SESSION_TTL_MS = 1000 * 60 * 60; // 1 hour

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readJson(fileName, fallback) {
  try {
    const raw = await fs.readFile(path.join(dataDir, fileName), "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJson(fileName, data) {
  await ensureDir(dataDir);
  await fs.writeFile(path.join(dataDir, fileName), JSON.stringify(data, null, 2), "utf-8");
}

function normalizeAddress(address = "") {
  return String(address).trim().toLowerCase();
}

function isEvmAddress(address = "") {
  return /^0x[0-9a-f]{40}$/i.test(address);
}

async function ensureKaspaAddress(address) {
  if (!address) throw new Error("Address is required");
  if (isEvmAddress(address)) return { isValid: true, skipped: true };
  if (!kaspaClient.url)
    return { isValid: true, skipped: true, reason: "Kaspa RPC disabled" };
  return kaspaClient.validateAddress(address);
}

async function verifyKaspaSignature({ address, signature, message }) {
  if (!address || !signature || !message) {
    throw new Error("Signature verification requires address, signature, and message");
  }
  if (isEvmAddress(address)) {
    return { isValid: true, skipped: true, reason: "EVM signature handled client-side" };
  }
  if (!kaspaClient.url) {
    return { isValid: true, skipped: true, reason: "Kaspa RPC disabled" };
  }
  await kaspaClient.validateAddress(address);
  return kaspaClient.verifyMessage({ address, signature, message });
}

class KaspaRpcClient {
  constructor({ url, username, password }) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.lastInfo = null;
  }

  get headers() {
    const headers = { "Content-Type": "application/json" };
    if (this.username || this.password) {
      const token = Buffer.from(
        `${this.username || ""}:${this.password || ""}`
      ).toString("base64");
      headers.Authorization = `Basic ${token}`;
    }
    return headers;
  }

  async call(method, params = {}) {
    if (!this.url) throw new Error("Kaspa RPC URL is not configured");
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    });
    let fetcher = globalThis.fetch;
    if (!fetcher) {
      const mod = await import("node-fetch").catch(() => null);
      fetcher = mod?.default;
    }
    if (!fetcher) throw new Error("Fetch API is not available in this runtime");
    const response = await fetcher(this.url, {
      method: "POST",
      headers: this.headers,
      body,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Kaspa RPC responded with ${response.status} ${response.statusText}: ${text}`
      );
    }
    const json = await response.json();
    if (json.error) throw new Error(json.error?.message || "Kaspa RPC returned an error");
    return json.result;
  }

  async getDagInfo() {
    const info = await this.call("getBlockDagInfo");
    this.lastInfo = info;
    return info;
  }

  async validateAddress(address) {
    if (!address) throw new Error("Missing address to validate");
    const result = await this.call("validateAddresses", { addresses: [address] });
    const first = Array.isArray(result?.entries) ? result.entries[0] : null;
    if (!first?.isValid) throw new Error("Invalid Kaspa address provided");
    return first;
  }

  async getUtxos(addresses) {
    return this.call("getUtxosByAddresses", { addresses });
  }

  async submitTransaction(transaction) {
    return this.call("submitTransaction", { transaction });
  }

  async verifyMessage({ address, signature, message }) {
    return this.call("messageVerify", { address, signature, message });
  }
}

const kaspaClient = new KaspaRpcClient({
  url: env.KASPA_RPC_URL,
  username: env.KASPA_RPC_USER,
  password: env.KASPA_RPC_PASS,
});

let rpcStatus = { healthy: false, lastChecked: null, error: null };

async function refreshRpcStatus() {
  try {
    await kaspaClient.getDagInfo();
    rpcStatus = { healthy: true, lastChecked: new Date().toISOString(), error: null };
  } catch (err) {
    rpcStatus = { healthy: false, lastChecked: new Date().toISOString(), error: err.message };
  }
}

refreshRpcStatus();
setInterval(refreshRpcStatus, 30000);

function requireFields(obj, fields) {
  const missing = fields.filter((field) => {
    const value = obj?.[field];
    return value === undefined || value === null || value === "";
  });
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

function createTentRecord(payload) {
  return {
    id: crypto.randomUUID(),
    state: "awaiting_partner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload,
  };
}

function buildEscrowRecord({ tentId, seller, buyer, nftId, price }) {
  return {
    id: crypto.randomUUID(),
    tentId,
    seller,
    buyer,
    nftId,
    price,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerSignature: null,
    buyerSignature: null,
    status: "awaiting_signatures",
  };
}

// -------------------------------------
// Routes
// -------------------------------------

app.get("/health", async (req, res) => {
  await refreshRpcStatus();
  res.json({ status: "ok", rpc: rpcStatus, dag: kaspaClient.lastInfo });
});

// Session verification / token minting
app.post("/session/verify", async (req, res) => {
  try {
    const { address, signature, message } = req.body || {};
    requireFields(req.body || {}, ["address", "signature", "message"]);
    const verification = await verifyKaspaSignature({ address, signature, message });
    if (!verification?.isValid)
      return res.status(403).json({ error: "Signature verification failed" });

    const sessions = await readJson("sessions.json", []);
    const filtered = sessions.filter(
      (entry) => normalizeAddress(entry.address) !== normalizeAddress(address)
    );
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const record = {
      id: crypto.randomUUID(),
      address,
      signature,
      message,
      token,
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    filtered.push(record);
    await writeJson("sessions.json", filtered);
    res.json({ token, expiresAt });
  } catch (err) {
    console.error("/session/verify error", err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Signature verification
app.post("/verify", async (req, res) => {
  try {
    const { address, signature, message } = req.body || {};
    requireFields(req.body || {}, ["address", "signature", "message"]);
    const verification = await verifyKaspaSignature({ address, signature, message });
    if (!verification?.isValid) return res.status(403).json({ status: "invalid" });
    res.json({ status: "verified" });
  } catch (err) {
    console.error("/verify error", err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Marketplace
app.get("/marketplace/listings", async (req, res) => {
  try {
    const listings = await readJson("listings.json", []);
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/marketplace/listings", async (req, res) => {
  try {
    const body = req.body || {};
    requireFields(body, ["name", "price", "seller"]);
    await ensureKaspaAddress(body.seller);
    const listings = await readJson("listings.json", []);
    const record = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "listed",
      ...body,
    };
    listings.push(record);
    await writeJson("listings.json", listings);
    res.json(record);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

const PORT = env.PORT || 5000;
app.listen(PORT, () => console.log(`🧩 HavenOx Tent API running on port ${PORT}`));
