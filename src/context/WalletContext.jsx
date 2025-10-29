// src/context/WalletContext.jsx — HavenOx Unified Wallet Context (Codex v1.2)
import { createContext, useContext, useState } from "react";
import { verifySession } from "../lib/apiClient";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [token, setToken] = useState("");

  const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS || "";
  const FEE_RATE = parseFloat(import.meta.env.VITE_FEE_RATE || "0.02");

  // ---------- Helpers ----------
  function persistToken(value) {
    try {
      if (value) localStorage.setItem("havenox_token", value);
      else localStorage.removeItem("havenox_token");
    } catch (_) {}
  }

  function getKaswareProvider() {
    return window.kasware || window.kdx || window.kaspium || null;
  }
  function getMetaMaskProvider() {
    return window.ethereum || null;
  }

  // ---------- Generic Sign ----------
  async function signMessage(walletType, msg, walletAddress) {
    if (!walletType || !msg) throw new Error("Missing wallet or message.");
    if (walletType.includes("Kasware")) {
      const kas = getKaswareProvider();
      if (!kas) throw new Error("Kasware wallet not detected.");
      if (typeof kas.signMessage === "function") return await kas.signMessage(msg);
      if (typeof kas.requestSignature === "function") {
        const res = await kas.requestSignature({ message: msg });
        return res?.signature || res;
      }
      throw new Error("Kasware wallet cannot sign messages.");
    }
    if (walletType.includes("MetaMask")) {
      const eth = getMetaMaskProvider();
      if (!eth) throw new Error("MetaMask not detected.");
      return await eth.request({
        method: "personal_sign",
        params: [walletAddress || address, msg],
      });
    }
    throw new Error("Unsupported wallet provider.");
  }

  // ---------- Secure Login ----------
  async function secureLogin(walletType, currentAddress) {
    const message = `Sign this message to verify ownership of ${currentAddress} on HavenOx. Nonce:${Date.now()}`;
    const signature = await signMessage(walletType, message, currentAddress);
    const data = await verifySession({ address: currentAddress, signature, message });

    if (data.status === "verified" || data.status === "ok") {
      const newToken = data.session_token || "";
      persistToken(newToken);
      setToken(newToken);
      alert("✅ Wallet verified and session created!");
    } else {
      throw new Error("Verification failed. Please try again.");
    }
  }

  // ---------- Wallet Connectors ----------
  async function connectKasware() {
    const kas = getKaswareProvider();
    if (!kas) throw new Error("Kasware/KDX wallet not found.");
    const accounts = await kas.requestAccounts();
    if (!accounts?.length) throw new Error("No Kasware accounts detected.");
    const currentAddress = accounts[0];
    try {
      await secureLogin("Kasware / KDX", currentAddress);
      setAddress(currentAddress);
      setProvider("Kasware / KDX");
      return { address: currentAddress, provider: "Kasware / KDX" };
    } catch (e) {
      throw new Error(e.message || "Kasware verification failed.");
    }
  }

  async function connectMetaMask() {
    const eth = getMetaMaskProvider();
    if (!eth) throw new Error("MetaMask not found.");
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts?.length) throw new Error("No MetaMask accounts detected.");
    const currentAddress = accounts[0];
    try {
      await secureLogin("MetaMask / EVM", currentAddress);
      setAddress(currentAddress);
      setProvider("MetaMask / EVM");
      return { address: currentAddress, provider: "MetaMask / EVM" };
    } catch (e) {
      throw new Error(e.message || "MetaMask verification failed.");
    }
  }

  // Unified connectWallet
  async function connectWallet(preferred) {
    const hasKasware = !!getKaswareProvider();
    const hasMetaMask = !!getMetaMaskProvider();
    const normalized =
      preferred || provider || (hasKasware ? "Kasware / KDX" : "");

    try {
      if (normalized === "Kasware / KDX" && hasKasware) return await connectKasware();
      if (normalized === "MetaMask / EVM" && hasMetaMask) return await connectMetaMask();

      if (hasKasware && hasMetaMask) {
        const useKasware =
          typeof window !== "undefined" &&
          typeof window.confirm === "function"
            ? window.confirm(
                "Kasware/KDX and MetaMask detected. Click OK for Kasware/KDX or Cancel for MetaMask."
              )
            : true;
        return useKasware ? await connectKasware() : await connectMetaMask();
      }

      if (hasKasware) return await connectKasware();
      if (hasMetaMask) return await connectMetaMask();
      throw new Error("No compatible wallet extension detected.");
    } catch (err) {
      const msg = err?.message || "Unable to connect wallet.";
      if (typeof window.alert === "function") window.alert("⚠️ " + msg);
      throw err;
    }
  }

  // ---------- Disconnect ----------
  function disconnectWallet() {
    setAddress("");
    setProvider("");
    setToken("");
    persistToken("");
  }

  // ---------- Unified Signer ----------
  async function signMessageWithWallet(message, options = {}) {
    const walletType = options.walletType || provider;
    const walletAddress = options.walletAddress || address;
    if (!walletType) throw new Error("No wallet provider connected.");
    if (!walletAddress) throw new Error("Wallet address missing.");
    return signMessage(walletType, message, walletAddress);
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        token,
        TREASURY_ADDRESS,
        FEE_RATE,
        connectKasware,
        connectMetaMask,
        connectWallet,
        disconnectWallet,
        signMessageWithWallet,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet() {
  return useContext(WalletContext);
}
