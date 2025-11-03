import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { useListings } from "../context/ListingsContext";
import { getTradeHistory } from "../lib/apiClient";
import ActiveEscrows from "../components/ActiveEscrows";
import { CSVLink } from "react-csv";

export default function Profile() {
  const { address } = useWallet();
  const { listings, loading } = useListings();

  const [myListings, setMyListings] = useState([]);
  const [trades, setTrades] = useState([]);
  const [msg, setMsg] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  // 🧩 Filter user’s listings
  useEffect(() => {
    if (address && listings.length > 0) {
      const walletLower = address.toLowerCase();
      const mine = listings.filter(
        (l) => (l.seller || "").toLowerCase() === walletLower
      );
      setMyListings(mine);
    } else {
      setMyListings([]);
    }
  }, [address, listings]);

  // 📜 Load trade history
  const loadTradeHistory = useCallback(async () => {
    try {
      setMsg("");
      setDebugInfo("Loading trades…");

      if (!address) {
        setTrades([]);
        setDebugInfo("No wallet connected.");
        return;
      }

      const response = await getTradeHistory(address);
      const allRows = Array.isArray(response?.trades) ? response.trades : [];
      const wallet = address.trim().toLowerCase();
      const mine = allRows.filter(
        (r) => (r.wallet || "").trim().toLowerCase() === wallet
      );

      setTrades(mine);
      setDebugInfo(
        `Fetched ${allRows.length} trades; matched ${mine.length} for ${address}`
      );
    } catch (err) {
      console.error(err);
      setMsg("⚠️ Unexpected error loading trade history.");
      setTrades([]);
      setDebugInfo(`Caught exception: ${err.message}`);
    }
  }, [address]);

  useEffect(() => {
    loadTradeHistory();
  }, [loadTradeHistory]);

  if (loading)
    return <div className="pt-32 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen pt-24 px-6 text-center">
      <h2 className="text-3xl font-bold mb-8 neon-text">My Profile</h2>

      {/* 🧠 Debug info + messages */}
      <p className="text-xs text-gray-500 mb-4">{debugInfo}</p>
      {msg && <p className="text-[#00FFA3] mb-6">{msg}</p>}

      {/* 🪪 Wallet Info */}
      <div className="glow-box w-full max-w-2xl mx-auto p-6 mb-10 text-left rounded-xl">
        {address ? (
          <>
            <p className="text-[#00E8C8] font-semibold mb-1">
              Wallet Address:
            </p>
            <p className="text-gray-300 mb-2 break-all">{address}</p>
            <p className="text-sm text-gray-400">
              Verified Listings: {myListings.length}
            </p>
            <p className="text-sm text-gray-400 mb-1">
              Networks Used: Kaspa / EVM
            </p>
          </>
        ) : (
          <p className="text-gray-400">Connect your wallet to view profile.</p>
        )}
      </div>

      {/* 🖼️ My Listings */}
      <div className="max-w-5xl mx-auto mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-[#00E8C8]">
          My Listings
        </h3>
        {myListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((item) => (
              <div
                key={item.id}
                className="border border-[#00E8C8]/30 rounded-xl p-4 bg-black/30"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h4 className="text-lg font-bold text-[#00FFA3] mb-1">
                  {item.name}
                </h4>
                <p className="text-gray-400 text-sm mb-1">
                  {item.type || "NFT"}
                </p>
                <p className="text-gray-300 mb-2">
                  {item.price} KAS — {item.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No listings found.</p>
        )}
      </div>

      {/* 💹 Trade History */}
      <div className="max-w-4xl mx-auto mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-[#00E8C8]">
          Trade History
        </h3>
        {trades.length > 0 ? (
          <>
            <CSVLink
              data={trades}
              filename="trade_history.csv"
              className="mb-4 inline-block bg-[#00E8C8]/20 border border-[#00E8C8]/40 px-4 py-2 rounded hover:bg-[#00E8C8]/30 text-sm"
            >
              Download CSV
            </CSVLink>
            <table className="w-full text-left border-collapse border border-[#00E8C8]/30">
              <thead>
                <tr className="text-[#00E8C8] border-b border-[#00E8C8]/30">
                  <th className="p-2">NFT</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Network</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr
                    key={t.id}
                    className="text-gray-300 border-b border-[#00E8C8]/10"
                  >
                    <td className="p-2">{t.nft_name || "-"}</td>
                    <td className="p-2">{t.action || "-"}</td>
                    <td className="p-2">{t.price || 0} KAS</td>
                    <td className="p-2">{t.network}</td>
                    <td className="p-2">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-gray-400">No trade history found.</p>
        )}
      </div>

      {/* 🤝 Active Escrows */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-4 text-[#00E8C8]">
          Active Escrows
        </h3>
        <ActiveEscrows wallet={address} />
      </div>
    </div>
  );
}
