import { useEffect, useState } from "react";

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchListings() {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/marketplace`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error("❌ Failed to load listings:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="min-h-screen pt-10 px-6 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#00FFA3]">
          HavenOx Marketplace
        </h1>
        <button
          onClick={fetchListings}
          className="text-sm bg-[#00E8C8]/30 border border-[#00E8C8]/50 text-[#00FFA3] px-4 py-2 rounded-lg hover:bg-[#00E8C8]/40 transition"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-400">Loading listings…</p>}
      {error && (
        <p className="text-red-400 text-sm">
          Unable to load listings: {error.message || "unexpected error"}
        </p>
      )}

      {!loading && listings.length === 0 && (
        <p className="text-gray-500">No NFTs listed yet. Be the first to mint!</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((nft) => (
          <article
            key={nft.id}
            className="border border-[#00E8C8]/30 rounded-2xl p-5 bg-black/40"
          >
            {nft.metadata?.image && (
              <img
                src={nft.metadata.image}
                alt={nft.metadata.name || nft.nftId}
                className="w-full h-52 object-cover rounded-xl mb-4"
                loading="lazy"
              />
            )}
            <h2 className="text-xl font-semibold text-[#00E8C8] mb-1">
              {nft.metadata?.name || nft.nftId}
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              {nft.metadata?.description || "Kaspa NFT"}
            </p>
            <p className="text-gray-300 font-medium mb-2">
              {nft.price ? `${nft.price} KAS` : "Not for sale"}
            </p>
            <p className="text-xs text-gray-500 mb-1">
              Creator: {nft.creator?.slice(0, 6)}…{nft.creator?.slice(-4)}
            </p>
            <p className="text-xs text-gray-500 mb-1">
              Royalty: {nft.royaltyPercent ?? 0}%
            </p>
            <p className="text-xs text-gray-500">
              Minted: {new Date(nft.createdAt).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
