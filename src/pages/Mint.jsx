// src/pages/Mint.jsx
import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { verifySignature } from "../lib/apiClient";

export default function Mint() {
  const { address, connectWallet, signMessageWithWallet } = useWallet();
  const [nftName, setNftName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleMint(e) {
    e.preventDefault();
    if (!address) {
      await connectWallet();
    }
    if (!nftName) return setStatus("⚠️ Please enter an NFT name.");

    try {
      setLoading(true);
      setStatus("⏳ Signing mint request...");

      const message = `Mint NFT ${nftName} at ${Date.now()}`;
      const signature = await signMessageWithWallet(message);

      const verify = await verifySignature({
        address,
        signature,
        message,
      });

      if (verify.status === "verified") {
        setStatus(`✅ NFT "${nftName}" verified and minted successfully.`);
      } else {
        setStatus("❌ Signature verification failed.");
      }
    } catch (err) {
      console.error(err);
      setStatus(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
      setNftName("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 px-4">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">Mint NFT</h1>
      <form
        onSubmit={handleMint}
        className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-5"
      >
        <input
          type="text"
          placeholder="NFT Name"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-lg transition"
        >
          {loading ? "Minting..." : "Mint NFT"}
        </button>
      </form>
      {status && <p className="text-cyan-300 mt-4 text-sm font-medium">{status}</p>}
    </div>
  );
}
