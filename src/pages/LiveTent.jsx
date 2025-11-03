import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useWallet } from "../context/WalletContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const socket = io(API_BASE.replace("/api", ""), { transports: ["websocket"] });

export default function LiveTent() {
  const { id } = useParams();
  const { address, connectWallet } = useWallet();
  const [tent, setTent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [statusFeed, setStatusFeed] = useState([]);
  const [error, setError] = useState(null);

  /* ------------------------------------------------------------
     Load Tent data
  ------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/tent/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTent(data.tent);
      } catch (err) {
        console.error("Tent fetch failed:", err.message);
        setError("Failed to load tent data.");
      }
    })();
  }, [id]);

  /* ------------------------------------------------------------
     Socket setup
  ------------------------------------------------------------ */
  useEffect(() => {
    socket.emit("joinTent", id);
    socket.on("presenceUpdate", ({ online }) => setOnlineCount(online));
    socket.on("systemMessage", (msg) =>
      setMessages((p) => [...p, { system: true, message: msg }])
    );
    socket.on("chatMessage", (msg) => setMessages((p) => [...p, msg]));
    socket.on("transactionStatus", (data) =>
      setStatusFeed((p) => [...p, data])
    );
    return () => socket.disconnect();
  }, [id]);

  /* ------------------------------------------------------------
     Send chat message
  ------------------------------------------------------------ */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const wallet = address || (await connectWallet())?.address;
    if (!wallet) return alert("Connect wallet first.");
    socket.emit("chatMessage", { tentId: id, sender: wallet, message: input });
    setInput("");
  };

  const sendTransactionStatus = (status) => {
    const wallet = address || "Unknown";
    socket.emit("transactionUpdate", { tentId: id, sender: wallet, status });
  };

  if (error) return <div className="text-red-500 p-6">{error}</div>;
  if (!tent) return <div className="text-cyan-400 p-6">Loading tent...</div>;

  /* ------------------------------------------------------------
     Render UI
  ------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-900 p-6 rounded-2xl shadow-lg flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-cyan-400 text-center">
          Live Tent: {tent.id}
        </h2>
        <p className="text-center text-gray-400">
          👥 Online users: <b>{onlineCount}</b>
        </p>

        {/* NFT preview */}
        {tent.metadata?.image && (
          <div className="flex justify-center">
            <img
              src={tent.metadata.image}
              alt="NFT"
              className="w-40 h-40 object-cover rounded-lg border border-gray-700"
            />
          </div>
        )}

        <div className="text-center text-gray-400 text-sm">
          NFT: <b>{tent.nftId}</b> | Price: <b>{tent.price} KAS</b> |{" "}
          <span className="text-cyan-400 font-semibold">{tent.status}</span>
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto h-60 border border-gray-700 rounded-lg p-4 bg-gray-800">
          {messages.map((m, i) => (
            <p key={i} className={m.system ? "text-gray-500" : ""}>
              {m.system ? (
                <em>{m.message}</em>
              ) : (
                <span>
                  <b>{m.sender.slice(0, 6)}:</b> {m.message}
                </span>
              )}
            </p>
          ))}
        </div>

        {/* ✅ Chat input box */}
        <form onSubmit={sendMessage} className="flex mt-2 space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-4 rounded-lg"
          >
            Send
          </button>
        </form>

        {/* Transaction controls */}
        <div className="mt-4 border-t border-gray-700 pt-4">
          <h3 className="text-lg text-cyan-400 mb-2">Transaction Status</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => sendTransactionStatus("NFT Sent")}
              className="bg-green-500 text-black px-3 py-1 rounded"
            >
              NFT Sent
            </button>
            <button
              onClick={() => sendTransactionStatus("KAS Received")}
              className="bg-blue-500 text-black px-3 py-1 rounded"
            >
              KAS Received
            </button>
            <button
              onClick={() => sendTransactionStatus("Trade Completed")}
              className="bg-yellow-400 text-black px-3 py-1 rounded"
            >
              Trade Completed
            </button>
          </div>

          {/* Log */}
          <ul className="mt-3 space-y-1 text-sm text-gray-300 max-h-32 overflow-y-auto">
            {statusFeed.map((s, i) => (
              <li key={i}>
                <b>{s.sender.slice(0, 6)}:</b> {s.status}{" "}
                <span className="text-gray-500 text-xs">
                  {new Date(s.time).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
