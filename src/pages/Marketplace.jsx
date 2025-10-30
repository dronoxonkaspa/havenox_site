import { useMemo } from "react";
import { useListings } from "../context/ListingsContext";

export default function Marketplace() {
  const { listings, loading, error, refresh } = useListings();

  const sorted = useMemo(() => {
    return [...listings].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [listings]);

  return (
    <div className="min-h-screen pt-10 px-6 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#00FFA3]">Kaspa Marketplace</h1>
        <button
          onClick={refresh}
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

      {!loading && sorted.length === 0 && (
        <p className="text-gray-500">No live listings yet. Be the first to mint!</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((listing) => (
          <article
            key={listing.id}
            className="border border-[#00E8C8]/30 rounded-2xl p-5 bg-black/40"
          >
            {listing.image_url && (
              <img
                src={listing.image_url}
                alt={listing.name}
                className="w-full h-52 object-cover rounded-xl mb-4"
                loading="lazy"
              />
            )}
            <h2 className="text-xl font-semibold text-[#00E8C8] mb-1">
              {listing.name}
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              {listing.type || "NFT"}
            </p>
            <p className="text-gray-300 font-medium mb-2">
              {listing.price} KAS • {listing.status || "listed"}
            </p>
            <p className="text-xs text-gray-500 mb-1">
              Seller: {listing.seller?.slice(0, 6)}…
              {listing.seller?.slice(-4)}
            </p>
            <p className="text-xs text-gray-500 mb-1">
              Royalty: {listing.royaltyPercent ?? 0}% →{" "}
              {listing.royaltyAddress || "-"}
            </p>
            <p className="text-xs text-gray-500">
              Created: {new Date(listing.createdAt).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
