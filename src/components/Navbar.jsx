// Navbar.jsx — HavenOx NFT Trading Tent (Kasware only)
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export default function Navbar() {
  const { address, connectKasware, disconnectWallet } = useWallet();

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-[#00040A] text-white shadow-lg border-b border-[#00E8C8]/10">
      {/* ---- Left Navigation ---- */}
      <div className="flex gap-6 items-center">
        <Link to="/" className="font-bold text-[#00FFA3] text-lg hover:text-[#00E8C8]">
          HavenOx
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

      {/* ---- Wallet Connect (Kasware only) ---- */}
      <div className="flex items-center gap-3">
        {!address ? (
          <button
            type="button"
            onClick={connectKasware}
            className="wallet-button bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00E8C8]/30 rounded-full px-4 py-1 hover:bg-[#00E8C8]/30 transition"
          >
            Connect Kasware / KDX
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-sm bg-[#00E8C8]/10 border border-[#00E8C8]/30 px-3 py-1 rounded-full">
              {address.slice(0, 6)}…{address.slice(-4)}
            </div>
            <button
              type="button"
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
