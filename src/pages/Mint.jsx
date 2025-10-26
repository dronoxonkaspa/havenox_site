// src/pages/Mint.jsx
import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { supabase } from "../lib/supabaseClient";

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

      const { data, error } = await supabase
        .from("mints")
        .insert([
          {
            name: form.name,
            description: form.description,
            image_url: form.image_url,
            creator: address,
            royalty_percent: parseFloat(form.royalty_percent) || 0,
          },
        ])
        .select()
        .single();
      if (error) throw error;

      const kas = window.kasware || window.kdx || window.kaspium;
      if (!kas) throw new Error("Kasware/KDX wallet not found.");
      const message = `Mint NFT "${form.name}" record ID: ${data.id}`;
      const signature = await kas.signMessage(message);

      await supabase
        .from("mints")
        .update({ signature })
        .eq("id", data.id);

      setMsg("✅ Mint recorded! Check your wallet for confirmation.");
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
            className="w-full bg-black/40 border border-[#00E8C8]/30 rounded px-3 py-2 mt-1"
            placeholder="NFT name"
          />
        </label>

        <label className="block mb-3 text-sm text-gray-400">
          Description
          <textarea
            name="description"
            onChange={handleChange}
            className="w-full bg-black/40 border border-[#00E8C8]/30 rounded px-3 py-2 mt-1"
            placeholder="Describe your NFT"
          />
        </label>

        <label className="block mb-3 text-sm text-gray-400">
          Image URL
          <input
            name="image_url"
            onChange={handleChange}
            className="w-full bg-black/40 border border-[#00E8C8]/30 rounded px-3 py-2 mt-1"
            placeholder="https://example.com/nft-image.png"
          />
        </label>

        <label className="block mb-6 text-sm text-gray-400">
          Royalty (%)
          <input
            name="royalty_percent"
            type="number"
            step="0.1"
            onChange={handleChange}
            className="w-full bg-black/40 border border-[#00E8C8]/30 rounded px-3 py-2 mt-1"
            placeholder="0 - 10"
          />
        </label>

        <button
          onClick={handleMint}
          className="btn-neon w-full py-2 font-semibold"
        >
          Mint
        </button>
      </div>
    </div>
  );
}
