import { useState } from "react";
import { useListings } from "../context/ListingsContext";

export default function Marketplace() {
  const { listings, loading } = useListings();
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  if (loading)
    return (
      <div className="pt-32 text-center text-gray-400">
        Loading listings...
      </div>
    );

  const filtered = verifiedOnly
    ? listings.filter((l) => !!l.signature)
    : listings;

  return (
    <div className="min-h-screen pt-24 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#00E8C8] mb-4 md:mb-0">
          Marketplace
        </h2>
        <label className="flex items-center gap-2 text-sm text-gray-400 select-none cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="accent-[#00E8C8] w-4 h-4"
          />
          Show verified only
        </label>
      </div>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">
          {verifiedOnly
            ? "No verified listings found."
            : "No listings yet — be the first to create one!"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`relative bg-black/40 border rounded-lg p-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,232,200,0.4)] ${
                item.signature
                  ? "border-[#00E8C8]/60"
                  : "border-gray-700 opacity-70"
              }`}
            >
              {/* Verified / Pending Tag */}
              {item.signature ? (
                <div className="absolute top-2 right-2 bg-[#00E8C8]/20 border border-[#00E8C8]/60 text-[#00FFA3] text-xs px-2 py-1 rounded-full shadow-[0_0_8px_rgba(0,255,163,0.6)]">
                  ✅ Verified
                </div>
              ) : (
                <div className="absolute top-2 right-2 bg-gray-800 text-gray-400 border border-gray-700 text-xs px-2 py-1 rounded-full">
                  Pending
                </div>
              )}

              {/* NFT Image */}
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="rounded-md mb-3 w-full h-48 object-cover border border-[#00E8C8]/20"
                />
              ) : (
                <div className="w-full h-48 mb-3 bg-gray-900 flex items-center justify-center text-gray-500 border border-[#00E8C8]/10 rounded-md">
                  No Image
                </div>
              )}

              {/* NFT Info */}
              <h3 className="text-lg font-semibold text-[#00FFA3] mb-1">
                {item.name}
              </h3>
              <p className="text-gray-400 text-sm mb-1">
                Network: {item.network || "Unknown"}
              </p>
              <p className="text-gray-500 text-xs mb-3">
                {item.type || "NFT Listing"}
              </p>

              {/* Price */}
              <p className="text-[#00E8C8] font-bold mb-3">{item.price} KAS</p>

              {/* Status Badge */}
              <p
                className={`text-xs mb-3 ${
                  item.status === "complete"
                    ? "text-[#00FFA3]" // green
                    : item.status === "pending"
                    ? "text-yellow-400" // yellow
                    : item.status === "expired"
                    ? "text-red-500" // red
                    : "text-gray-500" // default
                }`}
              >
                {item.status ? `Status: ${item.status}` : ""}
              </p>

              {/* Action Buttons */}
              {item.type === "SOLD" ? (
                <button
                  disabled
                  className="w-full py-2 rounded-full bg-gray-800 text-gray-400 font-semibold cursor-not-allowed"
                >
                  SOLD
                </button>
              ) : (
                <button
                  disabled={!item.signature}
                  className={`w-full py-2 rounded-full font-semibold transition ${
                    item.signature
                      ? "btn-neon"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {item.trade ? "Trade" : "Buy"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
