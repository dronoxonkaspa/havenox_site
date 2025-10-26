import { useWallet } from "../context/WalletContext";

export default function WalletConnect() {
  const { address, provider, connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="flex items-center gap-3">
      {!address ? (
        <button onClick={connectWallet} className="wallet-button">
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="wallet-button text-sm">
            🔗 {address.slice(0, 6)}…{address.slice(-4)}
            <span className="ml-1 text-xs opacity-60">({provider})</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-[#ff7777] border border-[#ff5555]/50 rounded-full px-3 py-1 text-xs hover:bg-[#ff5555] hover:text-black transition"
          >
            Disconnect
          </button>
        </>
      )}
    </div>
  );
}
