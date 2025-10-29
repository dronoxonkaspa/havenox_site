// LiveTent.jsx — HavenOx NFT Tent with signing + verification
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

const API_BASE = import.meta.env.VITE_API_BASE || "https://havenox-backend.onrender.com";

export default function LiveTent() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { address, connectKasware } = useWallet();

  const [tentData, setTentData] = useState(null);
  const [message, setMessage] = useState("⏳ Preparing NFT Tent...");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  const tentId = useMemo(() => params.id?.trim() ?? "", [params.id]);
  const password = searchParams.get("pw") || searchParams.get("pass") || searchParams.get("pwrd");

  // Join Tent session
  useEffect(() => {
    async function joinTent(signal) {
      if (!tentId) return;
      try {
        const res = await fetch(`${API_BASE}/tent/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal,
          body: JSON.stringify({
            tent_id: tentId,
            password,
            guest_wallet: address || "pending",
            nft_guest: { name: "NFT placeholder" }
          }),
        });
        const data = await res.json();
        if (res.ok && (data?.status === "joined")) {
          setTentData(data.tent || data);
          setMessage("✅ Joined NFT Tent");
        } else {
          setError(data?.message || "Failed to join tent.");
        }
      } catch (err) {
        if (err.name !== "AbortError") setError("Error joining tent.");
      }
    }
    const controller = new AbortController();
    joinTent(controller.signal);
    return () => controller.abort();
  }, [tentId, password, address]);

  // Cross-wallet signing helper (Kasware/KDX/Kaspium)
  async function signWithKaspaWallet(msg) {
    const kas = window.kasware || window.kdx || window.kaspium;
    if (!kas) throw new Error("Kasware/KDX wallet not detected.");
    if (typeof kas.signMessage === "function") return kas.signMessage(msg);
    if (typeof kas.requestSignature === "function") {
      const r = await kas.requestSignature({ message: msg });
      return r?.signature || r;
    }
    throw new Error("Kaspa wallet does not support message signing.");
  }

  // Sign + verify tent participation
  async function handleVerify() {
    try {
      if (!address) return alert("Connect your Kasware/KDX wallet first.");
      const msg = `I, ${address}, confirm participation in Tent ${tentId} at ${new Date().toISOString()}`;
      const signature = await signWithKaspaWallet(msg);

      const res = await fetch(`${API_BASE}/verify_signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message: msg, signature, tent_id: tentId }),
      });
      const data = await res.json();

      if (res.ok && (data?.verified || data?.status === "verified")) {
        setVerified(true);
        alert("✅ Signature verified and stored on backend.");
      } else {
        alert("❌ Signature invalid or unverified.");
      }
    } catch (err) {
      console.error("Verify error:", err);
      alert("Error verifying signature: " + err.message);
    }
  }

  // Finalize trade
  async function handleComplete() {
    try {
      setMessage("⏳ Finalizing trade...");
      const res = await fetch(`${API_BASE}/tent/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tent_id: tentId }),
      });
      const data = await res.json();
      if (res.ok && data?.status === "complete") {
        setMessage("✅ NFT trade finalized!");
      } else {
        setError(data?.message || "Trade could not complete.");
      }
    } catch {
      setError("Trade finalize error.");
    }
  }

  if (error)
    return <div className="p-8 text-center text-red-500 font-semibold">❌ {error}</div>;

  return (
    <div className="p-8 flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold mb-4 text-white">🎨 HavenOx NFT Tent</h1>
      <p className="text-gray-300 mb-4">{message}</p>

      {tentData && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full">
          <p className="text-sm text-gray-400 mb-2">Tent ID: {tentId}</p>
          <p className="text-sm text-gray-400 mb-2">
            Wallet: <span className="text-white">{address || "Not connected"}</span>
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Verified:{" "}
            <span className={verified ? "text-green-400" : "text-yellow-400"}>
              {verified ? "Yes" : "No"}
            </span>
          </p>

          {!verified && (
            <button
              onClick={handleVerify}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-3 w-full"
            >
              🖋️ Sign & Verify Tent
            </button>
          )}

          {verified && (
            <button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full"
            >
              ✅ Complete Trade
            </button>
          )}
        </div>
      )}

      {!address && (
        <button
          onClick={connectKasware}
          className="mt-8 bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00E8C8]/30 rounded-full px-4 py-1 hover:bg-[#00E8C8]/30 transition"
        >
          Connect Kasware / KDX
        </button>
      )}
    </div>
  );
}
