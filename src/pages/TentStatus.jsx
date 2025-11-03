import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE.replace("/api", ""), {
  transports: ["websocket"],
});

export default function TentStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tent, setTent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTent = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/tent/${id}`);
      const data = await res.json();
      if (res.ok) setTent(data.tent);
      setLoading(false);
    };
    fetchTent();
    socket.emit("joinTent", id);
    socket.on("tentUpdated", (t) => setTent(t));
    return () => socket.disconnect();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading tent...
      </div>
    );

  if (!tent)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Tent not found.
      </div>
    );

  const bothJoined = tent.status === "active" && tent.buyer;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-900 p-8 rounded-2xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-4">
          Tent Status
        </h1>
        <div className="border border-gray-700 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl text-cyan-400 font-semibold mb-2">
              Creator
            </h2>
            <p className="text-sm break-all text-gray-400">{tent.seller}</p>
            {tent.metadata?.image && (
              <img
                src={tent.metadata.image}
                alt="NFT"
                className="w-full h-40 object-cover rounded-lg mt-2"
              />
            )}
            <p className="mt-3 text-gray-300">
              Offer: <b>{tent.nftId || "NFT TBD"}</b>
            </p>
            <p className="text-gray-300">Kas: {tent.price || 0}</p>
            <p className="text-gray-400 mt-2">
              {tent.status === "awaiting_partner"
                ? "Awaiting partner..."
                : "✅ Active"}
            </p>
          </div>

          <div>
            <h2 className="text-xl text-cyan-400 font-semibold mb-2">
              Partner
            </h2>
            <p className="text-sm break-all text-gray-400">
              {tent.buyer || "Pending join"}
            </p>
            <p className="mt-3 text-gray-300">Offer: Pending</p>
            <p className="text-gray-300">Kas: 0</p>
            <p className="text-gray-400 mt-2">
              {tent.buyer ? "✅ Joined" : "Waiting for partner"}
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400 mb-3">
            Tent ID: <code className="text-xs">{tent.id}</code>
          </p>
          {bothJoined ? (
            <button
              onClick={() => navigate(`/tent/live/${tent.id}`)}
              className="bg-cyan-500 hover:bg-cyan-600 text-black px-5 py-3 rounded-lg font-semibold transition"
            >
              Enter Live Tent
            </button>
          ) : (
            <p className="text-gray-500 italic">
              Waiting for both users to join.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
