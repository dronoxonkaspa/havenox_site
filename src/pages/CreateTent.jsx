import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";

/**
 * CreateTent.jsx
 * ---------------------------------------------------------------
 * Handles NFT upload, tent creation, and automatic redirect to
 * the Tent Status page after successful creation.
 */
export default function CreateTent() {
  const { address, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nftId: "",
    kasAmount: "",
    partnerEmail: "",
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const ensureWallet = async () => {
    if (address) return address;
    const res = await connectWallet();
    return res?.address;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const wallet = await ensureWallet();
      if (!wallet) throw new Error("Wallet connection required.");

      const payload = {
        seller: wallet,
        buyer: form.partnerEmail || null,
        nftId: form.nftId || "Unnamed NFT",
        price: form.kasAmount ? Number(form.kasAmount) : 0,
        metadata: { image: preview || null },
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/tent/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Creation failed.");
      setMessage("✅ Tent created successfully!");
      navigate(`/tent/status/${data.tent.id}`);
    } catch (err) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-xl space-y-5"
      >
        <h2 className="text-2xl font-bold text-cyan-400 text-center">
          Create New Tent
        </h2>
        <input
          name="nftId"
          placeholder="NFT ID"
          value={form.nftId}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />
        <input
          name="kasAmount"
          placeholder="Kaspa amount"
          value={form.kasAmount}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />
        <input
          name="partnerEmail"
          type="email"
          placeholder="Partner Email"
          value={form.partnerEmail}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full h-48 border-2 border-dashed border-cyan-400/40 rounded-lg flex flex-col items-center justify-center hover:border-cyan-400 transition cursor-pointer"
        >
          {preview ? (
            <img
              src={preview}
              alt="NFT Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <>
              <p className="text-cyan-400">Drag & Drop NFT Image</p>
              <p className="text-gray-500 text-sm">or click to choose a file</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleDrop}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-lg transition"
        >
          {loading ? "Creating..." : "Create Tent"}
        </button>
        {message && (
          <p className="text-sm text-cyan-300 text-center">{message}</p>
        )}
      </form>
    </div>
  );
}
