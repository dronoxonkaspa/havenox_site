import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { createTentSession } from "../lib/apiClient";

const initialForm = {
  name: "",
  nftId: "",
  partnerWallet: "",
  kasAmount: "",
};

export default function CreateTent() {
  const { address, connectWallet, signMessageWithWallet } = useWallet();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const ensureWallet = async () => {
    if (address) return address;
    const result = await connectWallet();
    return result?.address;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setLoading(true);
      const walletAddress = await ensureWallet();
      if (!walletAddress) throw new Error("Wallet connection is required.");

      const signingMessage = `Create Tent ${form.name} with ${form.partnerWallet} @ ${Date.now()}`;
      const signature = await signMessageWithWallet(signingMessage, {
        walletAddress,
      });

      const payload = {
        tentName: form.name,
        creatorAddress: walletAddress,
        partnerAddress: form.partnerWallet,
        creatorOffer: {
          nftId: form.nftId || null,
          kasAmount: form.kasAmount ? Number(form.kasAmount) : 0,
        },
        message: signingMessage,
        signature,
      };

      const tent = await createTentSession(payload);
      setSubmitted(tent);
      setMessage("✅ Tent created and signature recorded.");
      setForm(initialForm);
    } catch (err) {
      console.error(err);
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-gray-100">
        <h2 className="text-3xl text-cyan-400 font-bold mb-4">
          Tent Created!
        </h2>
        <p className="text-gray-400 mb-2">
          Share your tent link with your trading partner.
        </p>
        <code className="text-xs bg-black/40 px-3 py-1 rounded">
          /tent/{submitted.id}
        </code>
      </div>
    );

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
          name="name"
          placeholder="Tent name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />
        <input
          name="nftId"
          placeholder="NFT ID"
          value={form.nftId}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />
        <input
          name="kasAmount"
          placeholder="Kaspa amount (optional)"
          value={form.kasAmount}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />
        <input
          name="partnerWallet"
          placeholder="Partner Kaspa wallet address"
          value={form.partnerWallet}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />
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
