import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100">
      <h1 className="text-5xl font-bold mb-6 text-cyan-400">HavenOx NFT Tent</h1>
      <p className="max-w-xl text-center mb-8 text-gray-400">
        Securely trade and verify Kaspa NFTs in real-time.  
        No intermediaries, no risks — peer-to-peer trust powered by HavenOx.
      </p>
      <div className="flex gap-4">
        <Link
          to="/createtent"
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold shadow-lg transition"
        >
          Create Tent
        </Link>
        <Link
          to="/livetent"
          className="px-6 py-3 rounded-xl border border-cyan-400 hover:bg-cyan-400 hover:text-black transition"
        >
          View Live Tents
        </Link>
      </div>
    </div>
  );
}
