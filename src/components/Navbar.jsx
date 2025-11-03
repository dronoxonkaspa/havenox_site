import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export default function Navbar() {
  const { address, connectWallet, disconnectWallet } = useWallet();

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-[#00040A] text-white shadow-lg border-b border-[#00E8C8]/10">
      {/* Left Navigation */}
      <div className="flex gap-6 items-center">
        <Link
          to="/"
          className="font-bold text-[#00FFA3] text-lg hover:text-[#00E8C8]"
        >
          HavenOx
        </Link>
        <Link
          to="/profile"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          Profile
        </Link>
        <Link
          to="/marketplace"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          Marketplace
        </Link>
        <Link
          to="/tents"
          className="hover:text-[#00E8C8] transition duration-200"
        >
          Live Tents
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

      {/* Wallet Connect */}
      <div className="flex items-center gap-3">
        {!address ? (
          <button
            type="button"
            onClick={() => connectWallet().catch(() => {})}
            className="bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00E8C8]/30 rounded-full px-4 py-1 hover:bg-[#00E8C8]/30 transition"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            type="button"
            onClick={() => disconnectWallet()}
            className="bg-[#00E8C8]/20 text-[#00E8C8] border border-[#00E8C8]/40 rounded-full px-4 py-1 hover:bg-[#00E8C8]/40 transition"
          >
            Disconnect
          </button>
        )}
      </div>
    </nav>
  );
}
