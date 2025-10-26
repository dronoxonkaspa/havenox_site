import { useState } from "react";

export default function SignButton({ address }) {
  const [status, setStatus] = useState("idle");

  const handleSign = async () => {
    if (!window.ethereum || !address)
      return alert("Connect your wallet first.");

    try {
      // 1️⃣  Build a unique escrow message
      const message = `Confirm Escrow Session: ${crypto.randomUUID()}`;

      // 2️⃣  Ask wallet to sign it
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      setStatus("verifying");

      // 3️⃣  Send to Flask backend for verification
      const res = await fetch("http://127.0.0.1:5000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature, address }),
      });
      const data = await res.json();

      // 4️⃣  Display result
      if (data.valid) {
        setStatus("✅ Signature Verified");
        alert("✅ Trade signature verified!");
      } else {
        setStatus("❌ Invalid Signature");
        alert("❌ Signature invalid or mismatched address!");
      }
    } catch (err) {
      console.error(err);
      alert("Signature process failed");
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
