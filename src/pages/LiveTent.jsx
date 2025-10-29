// src/pages/LiveTent.jsx — HavenOx NFT Tent (Unified Wallet & API Flow)
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import {
  completeTentSession,
  joinTentSession,
  verifySignature,
} from "../lib/apiClient";

export default function LiveTent() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { address, provider, connectWallet, signMessageWithWallet } = useWallet();

  const [tentData, setTentData] = useState(null);
  const [message, setMessage] = useState("⏳ Preparing NFT Tent...");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  const tentId = useMemo(() => params.id?.trim() ?? "", [params.id]);
  const password = searchParams.get("pw");

  // 🪶 Join Tent Session
  useEffect(() => {
    async function joinTent(signal) {
      if (!tentId) return;
      try {
        const data = await joinTentSession(
          {
            tent_id: tentId,
            password,
            guest_wallet: address || "pending",
            nft_guest: { name: "NFT placeholder" },
          },
          { signal }
        );

        if (data.status === "joined") {
          setTentData(data);
          setMessage("✅ Joined NFT Tent");
        } else {
          setError(data.message || "Failed to join tent.");
        }
      } catch (err) {
        if (err.name !== "AbortError") setError("Error joining tent.");
      }
    }

    const controller = new AbortController();
    joinTent(controller.signal);
    return () => controller.abort();
  }, [tentId, password, address]);

  // 🖋️ Sign + Verify Tent Participation
  async function handleVerify() {
    try {
      if (!address) {
        alert("⚠️ Connect a wallet first.");
        return;
      }

      const msg = `I, ${address}, confirm participation in Tent ${tentId} at ${new Date().toISOString()}`;
      let walletAddress = address;
      let walletType = provider;

      if (!walletAddress) {
        const result = await connectWallet().catch(() => null);
        walletAddress = result?.address || walletAddress;
        walletType = result?.provider || walletType;
      }
      if (!walletAddress) {
        alert("⚠️ Connect a wallet before signing.");
        return;
      }

      // ✍️ Sign and verify using unified helpers
      const signature = await signMessageWithWallet(msg, {
        walletType,
        walletAddress,
      });

      const data = await verifySignature({
        address: walletAddress,
        message: msg,
        signature,
        tent_id: tentId,
      });

      if (data.verified || data.status === "verified") {
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

  // ✅ Complete Trade
  async function handleComplete() {
    try {
      setMessage("⏳ Finalizing trade...");
      const data = await completeTentSession({ tent_id: tentId });
      if (data.status === "complete") {
        setMessage("✅ NFT trade finalized!");
      } else {
        setError("Trade could not complete.");
      }
    } catch (err) {
      setError("Trade finalize error.");
    }
  }

  // ❌ Error UI
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        ❌ {error}
      </div>
    );

  // 🧠 Main UI
  return (
    <div className="p-8 flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold mb-4 text-white">
        🎨 HavenOx NFT Tent
      </h1>
      <p className="text-gray-300 mb-4">{message}</p>

      {tentData && (
        <div className="bg-[#000915] p-6 rounded-xl border border-[#00E8C8]/20 max-w-md w-full">
          <p className="text-gray-400 text-sm mb-2">
            Tent ID:{" "}
            <span className="text-[#00FFA3] font-mono">{tentId}</span>
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
          onClick={() => connectWallet().catch(() => {})}
          className="mt-8 bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00E8C8]/30 rounded-full px-4 py-1 hover:bg-[#00E8C8]/30 transition"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
