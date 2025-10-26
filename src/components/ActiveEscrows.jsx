import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useWallet } from "../context/WalletContext";

export default function ActiveEscrows({ wallet }) {
  const { address } = useWallet();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");

  // Load both buyer and seller sessions + subscribe to realtime changes
  useEffect(() => {
    if (!wallet) return;
    loadEscrows();

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

  // Fetch all escrows where user is buyer or seller
  async function loadEscrows() {
    const { data, error } = await supabase
      .from("escrow_sessions")
      .select("*")
      .or(`seller.eq.${wallet},buyer.eq.${wallet}`)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setSessions(data || []);
  }

  // Request signature + update Supabase
  async function confirmEscrow(id, role) {
    try {
      setMsg("Requesting signature...");
      const message = `Confirm Escrow ${id} as ${role}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      const updateField =
        role === "seller" ? { seller_signature: signature } : { buyer_signature: signature };

      const { error } = await supabase
        .from("escrow_sessions")
        .update(updateField)
        .eq("id", id);

      if (error) throw error;
      setMsg(`✅ ${role} signature added.`);
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
              Escrow ID: <span className="text-[#00E8C8]">{s.id}</span>
            </p>

            <p className="text-sm text-gray-400 mb-1">
              Seller: {s.seller.slice(0, 6)}…{s.seller.slice(-4)}
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

            {/* Show required signature buttons */}
            {s.status === "pending" && (
              <>
                {!s.seller_signature && s.seller === wallet && (
                  <button
                    onClick={() => confirmEscrow(s.id, "seller")}
                    className="btn-neon w-full py-2 font-semibold mb-2"
                  >
                    Sign as Seller
                  </button>
                )}
                {!s.buyer_signature && s.buyer === wallet && (
                  <button
                    onClick={() => confirmEscrow(s.id, "buyer")}
                    className="btn-neon w-full py-2 font-semibold"
                  >
                    Sign as Buyer
                  </button>
                )}
              </>
            )}

            {/* Display signatures */}
            <div className="mt-2 text-xs text-gray-500">
              Seller Sig:{" "}
              {s.seller_signature ? (
                <span className="text-[#00FFA3]">✓</span>
              ) : (
                "—"
              )}
              &nbsp;| Buyer Sig:{" "}
              {s.buyer_signature ? (
                <span className="text-[#00FFA3]">✓</span>
              ) : (
                "—"
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
