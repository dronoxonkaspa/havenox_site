import { useCallback, useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getEscrows, signEscrow } from "../lib/apiClient";

export default function ActiveEscrows({ wallet }) {
  const { address, provider } = useWallet();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");

  // Load escrows from backend
  const loadEscrows = useCallback(async () => {
    if (!wallet) return;
    try {
      const data = await getEscrows(wallet);
      const entries = Array.isArray(data?.escrows) ? data.escrows : [];
      setSessions(entries);
    } catch (err) {
      console.error("Failed to load escrows:", err);
      setMsg("⚠️ Unable to load escrow sessions.");
    }
  }, [wallet]);

  useEffect(() => {
    if (!wallet) return;
    loadEscrows();
    const interval = setInterval(loadEscrows, 15000);
    return () => clearInterval(interval);
  }, [wallet, loadEscrows]);

  // Sign escrow (buyer or seller)
  async function confirmEscrow(id, role) {
    try {
      setMsg("Requesting signature...");
      const message = `Confirm Escrow ${id} as ${role}`;
      let signature = "";

      if (provider === "MetaMask / EVM" && window.ethereum?.request) {
        signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, address],
        });
      } else {
        const kas = window.kasware || window.kdx || window.kaspium;
        if (!kas) throw new Error("Kaspa-compatible wallet not detected.");
        if (typeof kas.signMessage === "function")
          signature = await kas.signMessage(message);
        else if (typeof kas.requestSignature === "function") {
          const res = await kas.requestSignature({ message });
          signature = res?.signature || res;
        } else throw new Error("Wallet cannot sign messages.");
      }

      await signEscrow(id, { role, signature, signer: address });
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
            <p className="text-sm text-gray-400 mb-1">Seller: {s.seller}</p>
            <p className="text-sm text-gray-400 mb-1">Buyer: {s.buyer}</p>
            <p className="text-sm text-gray-400 mb-2">
              Price: <span className="text-[#00FFA3]">{s.price} KAS</span>
            </p>

            <div className="flex gap-3 mt-2">
              {!s.seller_signature &&
                s.seller?.toLowerCase() === wallet?.toLowerCase() && (
                  <button
                    onClick={() => confirmEscrow(s.id, "seller")}
                    className="bg-[#00E8C8]/20 border border-[#00E8C8]/40 px-3 py-1 rounded hover:bg-[#00E8C8]/30"
                  >
                    Sign as Seller
                  </button>
                )}
              {!s.buyer_signature &&
                s.buyer?.toLowerCase() === wallet?.toLowerCase() && (
                  <button
                    onClick={() => confirmEscrow(s.id, "buyer")}
                    className="bg-[#00FFA3]/20 border border-[#00FFA3]/40 px-3 py-1 rounded hover:bg-[#00FFA3]/30"
                  >
                    Sign as Buyer
                  </button>
                )}
            </div>

            {s.status === "complete" && (
              <p className="text-[#00FFA3] mt-2">✅ Escrow Complete</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
