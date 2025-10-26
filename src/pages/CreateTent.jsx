// src/pages/CreateTent.jsx
import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://drono-guard-bot.onrender.com";

export default function CreateTent() {
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/tent/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host_wallet:
            "kaspa:qpz39pyz2ra8g0jtq7f0x9nrdzrllsenx282k5dqv8kgdmw7hsm9zcguzxr5y",
          price,
          guest_email: email,
        }),
      });
      const data = await res.json();
      if (data.status === "created") {
        setResult(data);
      } else {
        setError(data.message || "Error creating tent.");
      }
    } catch (err) {
      console.error(err);
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00040A] text-[#C0C7C9] px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-8 text-[#00FFA3]">🎪 Create P2P Tent</h1>

      <div className="border border-[#00E8C8]/40 rounded-2xl p-8 w-full max-w-md bg-black/30 shadow-lg">
        <label className="block mb-3 text-left">
          Guest Email:
          <input
            className="w-full mt-1 px-3 py-2 rounded-md bg-[#0a0a0a] border border-[#00E8C8]/40"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="guest@example.com"
          />
        </label>

        <label className="block mb-4 text-left">
          Price (KAS):
          <input
            className="w-full mt-1 px-3 py-2 rounded-md bg-[#0a0a0a] border border-[#00E8C8]/40"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="10"
          />
        </label>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-2 bg-[#00FFA3]/30 border border-[#00E8C8]/50 rounded-full hover:bg-[#00E8C8]/60 hover:text-black font-semibold transition"
        >
          {loading ? "Creating..." : "Create Tent"}
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        {result && (
          <div className="mt-6 text-sm break-all">
            <p className="text-[#00E8C8]">✅ Tent Created!</p>
            <p>
              <b>Invite Link:</b>{" "}
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FFA3] underline"
              >
                {result.link}
              </a>
            </p>
            <p>
              <b>Password:</b> {result.password}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
