// src/pages/LiveTent.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://drono-guard-bot.onrender.com";

export default function LiveTent() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { address, connectMetamask, connectKasware } = useWallet();

  const [tentData, setTentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("⏳ Setting up your Live Tent...");

  const tentId = useMemo(() => params.id?.trim() ?? "", [params.id]);
  const password = searchParams.get("pw");

  // 🔄 Fetch tent data
  useEffect(() => {
    async function fetchTent(signal) {
      if (!tentId) {
        setError("Invalid tent link.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/tent/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal,
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
        if (err.name === "AbortError") return;
        console.error("Tent fetch error:", err);
        setError("Error loading tent.");
      } finally {
        setLoading(false);
      }
    }

    const abortController = new AbortController();
    fetchTent(abortController.signal);

    return () => abortController.abort();
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

  // 🧩 UI Rendering
  if (loading)
    return (
      <div className="p-8 text-center text-gray-400 animate-pulse">
        {message}
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        ❌ {error}
      </div>
    );

  return (
    <div className="p-8 flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold mb-4 text-white">🎪 Live Tent</h1>

      <p className="text-gray-300 mb-6">{message}</p>

      {tentData && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full">
          <p className="text-sm text-gray-400 mb-2">
            Tent ID: <span className="text-white">{tentId}</span>
          </p>
          <p className="text-sm text-gray-400 mb-2">
            Host:{" "}
            <span className="text-white">
              {tentData.host_wallet || "Unknown"}
            </span>
          </p>
          <p className="text-sm text-gray-400 mb-2">
            Guest:{" "}
            <span className="text-white">
              {tentData.guest_wallet || address || "Not connected"}
            </span>
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Status:{" "}
            <span className="text-white capitalize">
              {tentData.status || "unknown"}
            </span>
          </p>

          {tentData.status !== "complete" && (
            <button
              onClick={handleComplete}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              ✅ Complete Trade
            </button>
          )}
        </div>
      )}

      {!address && (
        <div className="mt-8 flex gap-4">
          <button
            onClick={connectKasware}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
          >
            Connect Kasware
          </button>
          <button
            onClick={connectMetamask}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-white"
          >
            Connect MetaMask
          </button>
        </div>
      )}
    </div>
  );
}
