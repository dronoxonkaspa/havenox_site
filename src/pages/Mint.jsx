// src/pages/Mint.jsx
import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { mintNft } from "../lib/apiClient";

export default function Mint() {
  const { address } = useWallet();
  const [form, setForm] = useState({
    name: "",
    description: "",
    image_url: "",
    royalty_percent: 0,
  });
  const [msg, setMsg] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleMint() {
    try {
      if (!address) throw new Error("Connect your wallet first.");
      setMsg("Preparing mint…");

      const kas = window.kasware || window.kdx || window.kaspium;
      if (!kas) throw new Error("Kasware/KDX wallet not found.");

      const metadata = {
        name: form.name,
        description: form.description,
        image: form.image_url,
        royalty_percent: parseFloat(form.royalty_percent) || 0,
      };

      const message = `HavenOx Mint | ${metadata.name} | ${address} | ${Date.now()}`;
      let signature = "";

      if (typeof kas.signMessage === "function") {
        signature = await kas.signMessage(message);
      } else if (typeof kas.requestSignature === "function") {
        const response = await kas.requestSignature({ message });
        signature = response?.signature || response;
      } else {
        throw new Error("Kasware wallet does not support message signing.");
      }

      const result = await mintNft({
        address,
        metadata,
        message,
        signature,
      });

      const mintId = result?.mint?.id || "pending";
      setMsg(`✅ Mint recorded! Mint ID: ${mintId}`);
    } catch (err) {
      console.error(err);
      setMsg("⚠️ " + err.message);
    }
  }

  return (
    <div className="min-h-screen pt-24 px-6 text-center">
      <h2 className="text-3xl font-bold mb-8 neon-text">Mint NFT</h2>
      {msg && <p className="text-[#00FFA3] mb-6">{msg}</p>}

      <div className="glow-box p-6 max-w-lg mx-auto text-left rounded-xl">
        <label className="block mb-3 text-sm text-gray-400">
          Name
          <input
            name="name"
            onChange={handleChange}
            value={form.name}
            className="w-full bg-black/40 border border-[#00E8C8]/30 rounded px-3 py-2 mt-1"
            placeholder="NFT name"
          />
        </label>

        <label className="block mb-3 text-sm text-gray-400">
          Description
          <textarea
            name="description"
            onChange={handleChange}
            value={form.description}
            className="w-full bg-black/40 border border-[#00E8C8]/30 rounded px-3 py-2 mt-1"
            placeholder="Short description"
          />
        </label>

        <label className="block mb-3 text-sm text-gray-400">
          Image URL
          <input
            name="image_url"
            onChange={handleChange}
            value={form.image_url}
            className="w-full bg-black/40 border border-[#00E8C8]/30 rounded px-3 py-2 mt-1"
            placeholder="https://example.com/image.png"
          />
        </label>

        <label className="block mb-3 text-sm text-gray-400">
          Royalty Percent
          <input
            name="royalty_percent"
            type="number"
            onChange={handleChange}
            value={form.royalty_percent}
            className="w-full bg-black/40 border border-[#00E8C8]/30 rounded px-3 py-2 mt-1"
            placeholder="0"
          />
        </label>

        <button
          onClick={handleMint}
          className="btn-primary w-full mt-4"
        >
          Mint NFT
        </button>
      </div>
    </div>
  );
}
