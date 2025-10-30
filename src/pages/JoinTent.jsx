import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useParams, useNavigate } from "react-router-dom";

export default function JoinTent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, connectWallet } = useWallet();
  const [tent, setTent] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchTent = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/tent/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load tent");
        setTent(data.tent);
      } catch (err) {
        setMessage(`⚠️ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTent();
  }, [id]);

  const handleJoin = async () => {
    try {
      setJoining(true);
      const wallet = address || (await connectWallet())?.address;
      if (!wallet) throw new Error("Wallet connection is required.");

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/tent/join/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer: wallet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Join failed");

      setMessage("✅ Joined! Redirecting to Live Tent...");
      setTimeout(() => navigate(`/tent/live/${id}`), 1000);
    } catch (err) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setJoining(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading tent details…
      </div>
    );

  if (!tent)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        {message || "Tent not found."}
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 p-6">
      <div className="max-w-lg bg-gray-900 p-8 rounded-2xl shadow-xl space-y-4 text-center">
        <h2 className="text-3xl text-cyan-400 font-bold mb-4">
          HavenOx Tent Invite
        </h2>
        <div className="text-gray-300 mb-4 text-left">
          <p><b>Seller:</b> {tent.seller}</p>
          <p><b>NFT:</b> {tent.nftId}</p>
          <p><b>Kas:</b> {tent.price}</p>
          <p><b>Status:</b> <span className="text-cyan-400">{tent.status}</span></p>
        </div>
        {tent.status === "awaiting_partner" ? (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-lg transition"
          >
            {joining ? "Joining…" : "Join Tent"}
          </button>
        ) : (
          <a
            href={`/tent/live/${id}`}
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 px-5 rounded-lg"
          >
            Enter Live Tent
          </a>
        )}
        {message && <p className="text-sm text-cyan-300 mt-4">{message}</p>}
      </div>
    </div>
  );
}
