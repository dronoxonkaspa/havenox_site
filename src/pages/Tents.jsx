import { useEffect, useState } from "react";

export default function Tents() {
  const [tents, setTents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTents();
  }, []);

  async function fetchTents() {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/tents`);
      const data = await res.json();
      setTents(data.tents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-gray-100 p-10">
      <h1 className="text-3xl font-bold text-[#00FFA3] mb-6">Active Tents</h1>
      {loading && <p className="text-gray-400">Loading tents...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}
      {tents.length === 0 && !loading && (
        <p className="text-gray-500">No tents created yet.</p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tents.map((t) => (
          <div
            key={t.id}
            className="border border-[#00E8C8]/30 rounded-xl p-5 bg-black/40"
          >
            <h2 className="text-xl text-[#00E8C8] mb-2">
              NFT: {t.nftId || "Unknown"}
            </h2>
            <p>Seller: {t.seller.slice(0, 10)}...</p>
            <p>Price: {t.price} KAS</p>
            <p>Status: {t.status}</p>
            <p className="text-sm text-gray-400 mt-2">
              Created: {new Date(t.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
