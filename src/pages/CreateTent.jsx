// src/pages/CreateTent.jsx
import { useState } from "react";
import { createTentSession } from "../lib/apiClient";

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
      const data = await createTentSession({
        host_wallet:
          "kaspa:qpz39pyz2ra8g0jtq7f0x9nrdzrllsenx282k5dqv8kgdmw7hsm9zcguzxr5y",
        price,
        guest_email: email,
      });

      if (data.status === "created") {
        setResult(data);
      } else {
        setError(data.message || "Error creating tent.");
      }
    } catch (err) {
      console.error(err);
      setError("Request failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00040A] text-[#C0C7C9] px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-8 text-[#00FFA3]">
        🎪 Create P2P Tent
      </h1>

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

        <label className="block mb-3 text-left">
          Tent Price (KAS):
          <input
            type="number"
            className="w-full mt-1 px-3 py-2 rounded-md bg-[#0a0a0a] border border-[#00E8C8]/40"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
          />
        </label>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-2 mt-4 bg-[#00E8C8]/20 border border-[#00E8C8]/40 rounded-lg hover:bg-[#00E8C8]/30"
        >
          {loading ? "Creating..." : "Create Tent"}
        </button>

        {error && <p className="mt-4 text-red-400">{error}</p>}

        {result && (
          <div className="mt-6 p-4 border border-[#00E8C8]/40 rounded-lg bg-black/40">
            <p className="text-[#00FFA3] mb-2 font-semibold">
              ✅ Tent Created Successfully!
            </p>
            <p className="text-sm text-gray-300">
              Tent Link:{" "}
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00E8C8] underline break-all"
              >
                {result.link}
              </a>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Password: <span className="text-[#00FFA3]">{result.password}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
