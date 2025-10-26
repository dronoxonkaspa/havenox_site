import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useListings } from "../context/ListingsContext";
import { supabase } from "../lib/supabaseClient";
import ActiveEscrows from "../components/ActiveEscrows";
import { CSVLink } from "react-csv";

export default function Profile() {
  const { address } = useWallet();
  const { listings, loading } = useListings();

  const [myListings, setMyListings] = useState([]);
  const [trades, setTrades] = useState([]);
  const [msg, setMsg] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  // ---- Load personal listings + trade history ----
  useEffect(() => {
    if (address && listings.length > 0) {
      const mine = listings.filter(
        (l) =>
          l.signature &&
          l.signature.toLowerCase().includes(address.slice(2, 8).toLowerCase())
      );
      setMyListings(mine);
    } else {
      setMyListings([]);
    }
  }, [address, listings]);

  useEffect(() => {
    loadTradeHistory();
  }, [address]);

  async function loadTradeHistory() {
    try {
      setMsg("");
      setDebugInfo("Loading trades…");

      // 1) Fetch ALL rows from trade_history
      //    (if RLS blocks select, rows will be empty)
      const { data, error } = await supabase
        .from("trade_history")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Supabase trade_history error:", error);
        setMsg("⚠️ Cannot read trade history (RLS/policy or schema issue).");
        setTrades([]);
        setDebugInfo(`Error from Supabase: ${error.message}`);
        return;
      }

      // 2) Client-side case-insensitive, trimmed match
      const wallet = (address || "").trim().toLowerCase();
      const allRows = Array.isArray(data) ? data : [];
      const mine = allRows.filter(
        (r) => (r.wallet || "").trim().toLowerCase() === wallet
      );

      setTrades(mine);
      setDebugInfo(
        `Fetched ${allRows.length} rows; matched ${mine.length} for ${address || "no address"}`
      );
    } catch (err) {
      console.error(err);
      setMsg("⚠️ Unexpected error loading trade history.");
      setTrades([]);
      setDebugInfo(`Caught exception: ${err.message}`);
    }
  }

  if (loading)
    return <div className="pt-32 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen pt-24 px-6 text-center">
      <h2 className="text-3xl font-bold mb-8 neon-text">My Profile</h2>

      {/* ---- Small debug line to help validate data flow ---- */}
      <p className="text-xs text-gray-500 mb-4">{debugInfo}</p>
      {msg && <p className="text-[#00FFA3] mb-6">{msg}</p>}

      {/* ---- Wallet Identity Card ---- */}
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
              Networks Used:{" "}
              {[...new Set(myListings.map((m) => m.network))].join(", ") || "—"}
            </p>
            <p className="text-sm text-gray-400">
              Last Active: {new Date().toLocaleString()}
            </p>
          </>
        ) : (
          <p className="text-gray-400">Connect your wallet to view details.</p>
        )}
      </div>

      {/* ---- My Listings ---- */}
      <div className="glow-box p-6 text-left mb-10">
        <h3 className="text-2xl font-semibold text-[#00FFA3] mb-6">
          My Active Listings
        </h3>
        {myListings.length === 0 ? (
          <p className="text-gray-400">No active listings found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {myListings.map((item) => (
              <div
                key={item.id}
                className="bg-black/40 border border-[#00E8C8]/40 rounded-lg p-4"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="rounded-md mb-3 w-full h-48 object-cover"
                />
                <h4 className="text-[#00FFA3] font-semibold mb-1">
                  {item.name}
                </h4>
                <p className="text-gray-400 text-sm mb-2">
                  {item.price} KAS • {item.network}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- Trade History ---- */}
      <div className="glow-box p-6 text-left mb-10">
        <h3 className="text-2xl font-semibold text-[#00FFA3] mb-6">
          Trade History
        </h3>
        {trades.length === 0 ? (
          <p className="text-gray-400">No completed trades yet.</p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {trades.map((t) => (
                <div
                  key={t.id}
                  className="nft-card p-3 border border-[#00E8C8]/30 rounded"
                >
                  <p className="text-gray-300 text-sm">
                    <span className="text-[#00E8C8]">{t.action}</span> —{" "}
                    {t.nft_name} for {t.price} KAS on {t.network}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.timestamp
                      ? new Date(t.timestamp).toLocaleString()
                      : "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* ---- CSV Export Button ---- */}
            <div className="mt-6 text-center">
              <CSVLink
                data={trades}
                filename="dronox_trade_history.csv"
                className="btn-neon px-6 py-2 rounded-full font-semibold"
              >
                Download Trade History CSV
              </CSVLink>
            </div>
          </>
        )}
      </div>

      {/* ---- Active Escrow Sessions ---- */}
      <div className="glow-box p-6 text-left mb-10">
        <h3 className="text-2xl font-semibold text-[#00FFA3] mb-6">
          Active Escrow Sessions
        </h3>
        <ActiveEscrows wallet={address} />
      </div>
    </div>
  );
}
