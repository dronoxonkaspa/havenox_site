// src/pages/LiveTent.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://drono-guard-bot.onrender.com";

export default function LiveTent() {
  const [searchParams] = useSearchParams();
  const { address, connectMetamask, connectKasware } = useWallet();

  const [tentData, setTentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("⏳ Setting up your Live Tent...");

  const tentId = window.location.pathname.split("/").pop();
  const password = searchParams.get("pw");

  // 🔄 Fetch tent data
  useEffect(() => {
    async function fetchTent() {
      try {
        const res = await fetch(`${API_BASE}/tent/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tent_id: tentId,
            password,
            guest_wallet: address || "",
            asset_guest: "NFT/Token",
          }),
        });

        const data = await res.json();

        if (data.status === "joined" || data.status === "pending") {
          setTentData(data.tent || data);
          setMessage("✅ Connected to Live Tent");
        } else {
          console.warn("Tent join error:", data);
          setError("Invalid or expired tent.");
        }
      } catch (err) {
        console.error("Tent fetch error:", err);
        setError("Error loading tent.");
      } finally {
        setLoading(false);
      }
    }
    fetchTent();
  }, [tentId, password, address]);

  // ✅ Complete trade
  async function handleComplete() {
    try {
      setMessage("⏳ Finalizing trade...");
      const res = await fetch(`${API_BASE}/tent/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tent_id: tentId }),
      });

      const data = await res.json();
      if (data.status === "complete") {
        setMessage("✅ Trade completed successfully!");
        setTentData({ ...tentData, status: "complete" });
      } else {
        console.warn("Trade completion error:", data);
        setError("⚠️ Could not complete trade.");
      }
    } catch (err) {
      console.error("Complete trade error:", err);
      setError("Error finalizing trade.");
    }
  }

  // 🧩 Helper: safe status text
  const safeStatus = tentData?.status
    ? tentData.status.toUpperCase()
    : "PENDING";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00040A] text-[#C0C7C9] px-4 py-12 text-center">
      <h1 className="text-3xl font-extrabold mb-8 text-[#00FFA3] tracking-wide drop-shadow-lg">
        🎪 HavenOx Live Trading Tent
      </h1>

      {loading ? (
        <div className="animate-pulse text-[#00FFA3] text-lg">{message}</div>
      ) : error ? (
        <p className="text-red-400 font-medium">{error}</p>
      ) : tentData ? (
        <div className="border border-[#00E8C8]/40 rounded-2xl p-8 w-full max-w-lg bg-black/30 shadow-lg backdrop-blur-lg">
          <div className="space-y-2 text-sm sm:text-base text-left">
            <p>
              <span className="text-[#00E8C8] font-semibold">Tent ID:</span>{" "}
              {tentData.id || "N/A"}
            </p>
            <p>
              <span className="text-[#00E8C8] font-semibold">Host Wallet:</span>{" "}
              <span className="break-all">{tentData.host_wallet || "N/A"}</span>
            </p>
            <p>
              <span className="text-[#00E8C8] font-semibold">Price:</span>{" "}
              {tentData.price || 0} KAS
            </p>
            <p>
              <span className="text-[#00E8C8] font-semibold">Status:</span>{" "}
              <span
                className={`font-bold ${
                  tentData.status === "complete"
                    ? "text-[#00FFA3]"
                    : "text-yellow-400"
                }`}
              >
                {safeStatus}
              </span>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {!address ? (
              <>
                <button
                  onClick={connectKasware}
                  className="px-5 py-2 rounded-full bg-[#00FFA3]/20 border border-[#00E8C8]/40 hover:bg-[#00E8C8]/30 transition"
                >
                  Connect Kasware / KDX
                </button>
                <button
                  onClick={connectMetamask}
                  className="px-5 py-2 rounded-full bg-[#00FFA3]/20 border border-[#00E8C8]/40 hover:bg-[#00E8C8]/30 transition"
                >
                  Connect MetaMask
                </button>
              </>
            ) : tentData.status === "complete" ? (
              <p className="text-[#00FFA3] font-semibold mt-2">
                ✅ Trade finalized successfully!
              </p>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-[#00FFA3]/30 border border-[#00E8C8]/50 rounded-full hover:bg-[#00E8C8]/60 hover:text-black font-semibold transition"
              >
                Finalize Trade
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-400">{message}</p>
      )}
    </div>
  );
}
