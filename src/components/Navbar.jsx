// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export default function Navbar() {
  const {
    address,
    provider,
    connectKasware,
    connectMetamask,
    disconnectWallet,
  } = useWallet();

  return (
    <nav className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-10 bg-black/50 backdrop-blur-md border-b border-[#00E8C8]/20 z-50">
      {/* ---- Brand / Home ---- */}
      <Link
        to="/"
        className="flex items-center gap-3 group cursor-pointer select-none"
      >
        <div className="relative w-9 h-9 flex items-center justify-center">
          <img
            src="/havenox-logo.png"
            alt="HavenOx Logo"
            className="w-9 h-9 object-contain hover:scale-110 transition-transform duration-300"
          />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#00E8C8] to-[#00FFA3] bg-clip-text text-transparent animate-pulse">
          HavenOx
        </h1>
      </Link>

      {/* ---- Nav Links ---- */}
      <div className="flex items-center gap-6 text-sm font-semibold">
        <Link to="/" className="hover:text-[#00E8C8] transition duration-200">
          Home
        </Link>
        <Link
          to="/marketplace"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          Marketplace
        </Link>
        <Link
          to="/create"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          Create
        </Link>
        <Link
          to="/mint"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          Mint
        </Link>
        <Link
          to="/create-tent"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          P2P Tent Trade
        </Link>
        <Link
          to="/profile"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          Profile
        </Link>
        <Link
          to="/about"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          About
        </Link>
        <Link
          to="/faq"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          FAQ
        </Link>
      </div>

      {/* ---- Wallet Connect ---- */}
      <div className="flex items-center gap-3">
        {!address ? (
          <div className="flex items-center gap-2">
            <button
              onClick={connectKasware}
              className="wallet-button bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00E8C8]/30 rounded-full px-4 py-1 hover:bg-[#00E8C8]/30 transition"
            >
              Connect Kasware / KDX
            </button>
            <button
              onClick={connectMetamask}
              className="wallet-button bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00E8C8]/30 rounded-full px-4 py-1 hover:bg-[#00E8C8]/30 transition"
            >
              Connect MetaMask
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-sm bg-[#00E8C8]/10 border border-[#00E8C8]/30 px-3 py-1 rounded-full">
              {address.slice(0, 6)}…{address.slice(-4)}
              <span className="text-xs text-gray-400 ml-2">
                ({provider})
              </span>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-xs text-[#ff7777] border border-[#ff5555]/50 rounded-full px-3 py-1 hover:bg-[#ff5555]/70 hover:text-black transition"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
