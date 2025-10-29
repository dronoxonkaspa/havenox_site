// src/components/SignButton.jsx — Unified Wallet Signature Verification
import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { verifySignature } from "../lib/apiClient";

export default function SignButton({ address }) {
  const [status, setStatus] = useState("idle");
  const { connectWallet, signMessageWithWallet, provider } = useWallet();

  const handleSign = async () => {
    try {
      setStatus("idle");

      let walletAddress = address;
      let walletType = provider;

      // 🧩 Connect wallet if not already
      if (!walletAddress) {
        const result = await connectWallet().catch(() => null);
        walletAddress = result?.address || walletAddress;
        walletType = result?.provider || walletType;
      }
      if (!walletAddress) {
        alert("⚠️ Connect your wallet first.");
        return;
      }

      // 1️⃣ Build a unique message to sign
      const message = `Confirm Escrow Session: ${crypto.randomUUID()}`;

      // 2️⃣ Sign message using unified helper
      const signature = await signMessageWithWallet(message, {
        walletAddress,
        walletType,
      });

      setStatus("verifying");

      // 3️⃣ Send to backend for verification
      const data = await verifySignature({
        message,
        signature,
        address: walletAddress,
      });

      // 4️⃣ Show result
      if (data.valid || data.status === "verified" || data.status === "ok") {
        setStatus("✅ Signature Verified");
        alert("✅ Trade signature verified!");
      } else {
        setStatus("❌ Invalid Signature");
        alert("❌ Signature invalid or mismatched address!");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Signature process failed: " + err.message);
      setStatus("error");
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleSign}
        className="px-8 py-3 border-2 border-kaspa rounded-full hover:bg-kaspa hover:text-black transition font-semibold shadow-[0_0_20px_rgba(0,232,200,0.3)]"
      >
        Sign Trade
      </button>
      {status !== "idle" && (
        <p className="mt-2 text-sm text-gray-400">{status}</p>
      )}
    </div>
  );
}
