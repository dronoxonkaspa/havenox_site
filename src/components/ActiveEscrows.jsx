// src/components/ActiveEscrows.jsx
import { useCallback, useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getEscrows, signEscrow } from "../lib/apiClient";

export default function ActiveEscrows({ wallet }) {
  const { address, provider, connectWallet, signMessageWithWallet } = useWallet();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");

  // 🔁 Load all escrows for the given wallet
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

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!wallet) {
      setSessions([]);
      return;
    }
    loadEscrows();
    const interval = setInterval(loadEscrows, 15000);
    return () => clearInterval(interval);
  }, [wallet, loadEscrows]);

  // 🔏 Confirm and sign escrow
  async function confirmEscrow(id, role) {
    try {
      setMsg("Requesting signature...");
      const message = `Confirm Escrow ${id} as ${role}`;

      // Ensure wallet connected
      let walletAddress = address;
      let walletType = provider;
      if (!walletAddress) {
        const result = await connectWallet().catch(() => null);
        walletAddress = result?.address || walletAddress;
        walletType = result?.provider || walletType;
      }
      if (!walletAddress) throw new Error("Connect a wallet before signing the escrow.");

      // Sign escrow message using unified helper
      const signature = await signMessageWithWallet(message, {
        walletAddress,
        walletType,
      });

      await signEscrow(id, { role, signature, signer: walletAddress });
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
              Seller: {s.seller?.slice(0, 6)}…{s.seller?.slice(-4)}
            </p>
            <p className="text-sm text-gray-400 mb-3">
              Buyer: {s.buyer?.slice(0, 6)}…{s.buyer?.slice(-4)}
            </p>

            <button
              onClick={() => confirmEscrow(s.id, "seller")}
              className="bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00E8C8]/30 rounded-full px-3 py-1 text-sm hover:bg-[#00E8C8]/30 transition"
            >
              ✍️ Sign as Seller
            </button>
            <button
              onClick={() => confirmEscrow(s.id, "buyer")}
              className="bg-[#00E8C8]/20 text-[#00E8C8] border border-[#00E8C8]/30 rounded-full px-3 py-1 text-sm ml-2 hover:bg-[#00FFA3]/30 transition"
            >
              ✍️ Sign as Buyer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
