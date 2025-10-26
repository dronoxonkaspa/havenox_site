import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useWallet } from "../context/WalletContext";

export default function ActiveEscrows({ wallet }) {
  const { address } = useWallet();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!wallet) return;
    loadEscrows();
    // Realtime updates for escrow sessions
    const channel = supabase
   .channel("realtime:escrow_sessions")
   .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "escrow_sessions" },
    () => loadEscrows()
  )
  .subscribe();

return () => supabase.removeChannel(channel);

  }, [wallet]);

  async function loadEscrows() {
    const { data, error } = await supabase
      .from("escrow_sessions")
      .select("*")
      .eq("seller", wallet)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setSessions(data);
  }

  async function confirmEscrow(id) {
    try {
      setMsg("Requesting signature...");
      const message = `Confirm Escrow ${id} as seller`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      const { error } = await supabase
        .from("escrow_sessions")
        .update({ seller_signature: signature })
        .eq("id", id);
      if (error) throw error;
      setMsg("✅ Seller signature added.");
      await loadEscrows();
    } catch (err) {
      console.error(err);
      setMsg("⚠️ " + err.message);
    }
  }

  if (!sessions.length)
    return <p className="text-gray-400">No active escrows.</p>;

  return (
    <div>
      {msg && <p className="text-[#00FFA3] mb-4">{msg}</p>}
      <div className="flex flex-col gap-4">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="nft-card p-4 border border-[#00E8C8]/30 rounded"
          >
            <p className="text-gray-300 mb-2">
              Listing ID:{" "}
              <span className="text-[#00E8C8]">{s.listing_id}</span>
            </p>
            <p className="text-sm text-gray-400 mb-1">
              Buyer: {s.buyer.slice(0, 6)}…{s.buyer.slice(-4)}
            </p>
            <p className="text-sm text-gray-400 mb-1">
              Price: {s.price} KAS • {s.network}
            </p>
            <p
              className={`text-xs mb-3 ${
                s.status === "complete"
                  ? "text-[#00FFA3]"
                  : s.status === "pending"
                  ? "text-yellow-400"
                  : "text-red-500"
              }`}
            >
              Status: {s.status}
            </p>

            {s.status === "pending" && !s.seller_signature && (
              <button
                onClick={() => confirmEscrow(s.id)}
                className="btn-neon w-full py-2 font-semibold"
              >
                Confirm Escrow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
