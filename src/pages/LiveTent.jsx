import { useEffect, useState } from "react";

export default function LiveTent() {
  const [tents, setTents] = useState([]);

  useEffect(() => {
    fetch("https://havenox-backend.onrender.com/tent")
      .then((res) => res.json())
      .then(setTents)
      .catch((err) => console.error("Error loading tents:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h2 className="text-4xl font-bold text-cyan-400 text-center mb-8">Live NFT Tents</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tents.map((t) => (
          <div key={t.id} className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">{t.name}</h3>
            <p className="text-sm text-gray-400 mb-2">NFT ID: {t.nftId}</p>
            <p className="text-xs text-gray-500">Partner: {t.partnerWallet}</p>
          </div>
        ))}
        {tents.length === 0 && (
          <p className="col-span-full text-center text-gray-500">No live tents yet.</p>
        )}
      </div>
    </div>
  );
}
