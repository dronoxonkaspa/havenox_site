import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getTent, API_BASE } from "../lib/apiClient";

export default function LiveTent() {
  const { id } = useParams();
  const [tent, setTent] = useState(null);
  const [tents, setTents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadTent() {
      try {
        setLoading(true);
        setError("");
        const data = await getTent(id);
        if (!ignore) setTent(data);
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(err.message || "Unable to load tent");
          setTent(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    async function loadAll() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE}/tent`);
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const res = await response.json();
        if (!ignore)
          setTents(Array.isArray(res?.tents) ? res.tents : []);
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(err.message || "Unable to load tents");
          setTents([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (id) loadTent();
    else loadAll();

    return () => {
      ignore = true;
    };
  }, [id]);

  const partnerSigned = useMemo(() => Boolean(tent?.signatures?.partner), [tent]);
  const creatorSigned = useMemo(() => Boolean(tent?.signatures?.creator), [tent]);

  // ---- ALL TENTS LIST VIEW ----
  if (!id) {
    if (loading)
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading tents…
        </div>
      );

    if (error)
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-400">
          <p className="mb-2">{error}</p>
          <p className="text-gray-500 text-sm">Unable to fetch tent directory.</p>
        </div>
      );

    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <h2 className="text-4xl font-bold text-cyan-400 text-center mb-8">
          Live NFT Tents
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tents.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800"
            >
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                {entry.tentName}
              </h3>
              <p className="text-sm text-gray-400 mb-1">
                NFT: {entry.creatorOffer?.nftId || "TBD"}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                Creator: {entry.creatorAddress?.slice(0, 6)}…
                {entry.creatorAddress?.slice(-4)}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Partner: {entry.partnerAddress?.slice(0, 6)}…
                {entry.partnerAddress?.slice(-4)}
              </p>
              <a
                href={`/tent/${entry.id}`}
                className="text-cyan-300 text-sm underline hover:text-cyan-200"
              >
                View Tent
              </a>
            </div>
          ))}
          {tents.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No live tents yet.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---- SINGLE TENT VIEW ----
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading tent…
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-400">
        <p className="mb-2">{error}</p>
        <p className="text-gray-500 text-sm">Check the URL and try again.</p>
      </div>
    );

  if (!tent)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Tent not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-cyan-400 text-center mb-4">
          {tent.tentName}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-8">
          Tent ID: {tent.id}
        </p>

        <section className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">Creator</h3>
            <p className="text-xs text-gray-500 mb-2">{tent.creatorAddress}</p>
            <p className="text-sm text-gray-400 mb-1">
              Offer: {tent.creatorOffer?.nftId || "NFT TBD"}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Kas: {tent.creatorOffer?.kasAmount || 0}
            </p>
            <p
              className={`text-sm font-semibold ${
                creatorSigned ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {creatorSigned ? "Signature received" : "Awaiting signature"}
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">Partner</h3>
            <p className="text-xs text-gray-500 mb-2">{tent.partnerAddress}</p>
            <p className="text-sm text-gray-400 mb-1">
              Offer: {tent.partnerOffer?.nftId || "Pending"}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Kas: {tent.partnerOffer?.kasAmount || 0}
            </p>
            <p
              className={`text-sm font-semibold ${
                partnerSigned ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {partnerSigned ? "Signature received" : "Awaiting partner"}
            </p>
          </div>
        </section>

        <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
          <h4 className="text-lg text-cyan-300 font-semibold mb-2">Status</h4>
          <p className="text-gray-300 mb-1">{tent.state}</p>
          {tent.settlementTx && (
            <p className="text-sm text-gray-400">
              Settlement Transaction:{" "}
              <span className="text-cyan-300">{tent.settlementTx}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
