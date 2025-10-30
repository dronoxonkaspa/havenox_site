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
  await fs.writeFile(
    path.join(dataDir, fileName),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
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
    if (!this.url) throw new Error("Kaspa RPC URL not configured");
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
    if (!fetcher) throw new Error("Fetch API unavailable");

    const response = await fetcher(this.url, {
      method: "POST",
      headers: this.headers,
      body,
    });
    if (!response.ok) throw new Error(await response.text());

    const json = await response.json();
    if (json.error) throw new Error(json.error?.message);
    return json.result;
  }

  async getDagInfo() {
    const info = await this.call("getBlockDagInfo");
    this.lastInfo = info;
    return info;
  }
  async validateAddress(address) {
    const result = await this.call("validateAddresses", { addresses: [address] });
    const first = Array.isArray(result?.entries) ? result.entries[0] : null;
    if (!first?.isValid) throw new Error("Invalid Kaspa address");
    return first;
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
  const missing = fields.filter(f => !obj[f]);
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
    tentId, seller, buyer, nftId, price,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerSignature: null, buyerSignature: null,
    status: "awaiting_signatures",
  };
}

/* --- ROUTES --- */

app.get("/health", async (_, res) => {
  await refreshRpcStatus();
  res.json({ status: "ok", rpc: rpcStatus, dag: kaspaClient.lastInfo });
});

// verify signature
app.post("/verify", async (req, res) => {
  try {
    const { address, signature, message } = req.body || {};
    requireFields(req.body, ["address", "signature", "message"]);
    await kaspaClient.validateAddress(address);
    const verification = await kaspaClient.verifyMessage({ address, signature, message });
    if (!verification?.isValid) return res.status(403).json({ status: "invalid" });
    res.json({ status: "verified" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// mint-nft
app.post("/mint-nft", async (req, res) => {
  try {
    const body = req.body || {};
    requireFields(body, ["nftId", "creator", "royaltyPercent", "signature", "message"]);
    await kaspaClient.validateAddress(body.creator);
    const verification = await kaspaClient.verifyMessage(body);
    if (!verification?.isValid) throw new Error("Signature mismatch");
    const mints = await readJson("mints.json", []);
    if (mints.some(m => m.nftId === body.nftId)) throw new Error("NFT already registered");
    const record = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body,
      royaltyAddress: body.royaltyAddress || body.creator,
    };
    mints.push(record);
    await writeJson("mints.json", mints);
    res.json(record);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// marketplace listings, tents, escrows routes (same as diff)
... (rest of your long diff code here, unchanged)
