import { useState } from "react";

export default function CreateTent() {
  const [form, setForm] = useState({ name: "", nftId: "", partnerWallet: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("https://havenox-backend.onrender.com/tent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitted(true);
  };

  if (submitted)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-gray-100">
        <h2 className="text-3xl text-cyan-400 font-bold mb-4">Tent Created!</h2>
        <p className="text-gray-400">Share your tent link with your trading partner.</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-xl space-y-5"
      >
        <h2 className="text-2xl font-bold text-cyan-400 text-center">Create New Tent</h2>

        <input
          name="name"
          placeholder="Tent name"
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />

        <input
          name="nftId"
          placeholder="NFT ID"
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />

        <input
          name="partnerWallet"
          placeholder="Partner Kaspa wallet address"
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
        />

        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-lg transition"
        >
          Create Tent
        </button>
      </form>
    </div>
  );
}
