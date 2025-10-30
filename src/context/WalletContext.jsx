import { createContext, useContext, useState } from "react";
import { verifySession } from "../lib/apiClient";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [token, setToken] = useState("");

  const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS || "";
  const FEE_RATE = parseFloat(import.meta.env.VITE_FEE_RATE || "0.02");

  function persistToken(value) {
    try {
      if (value) localStorage.setItem("havenox_token", value);
      else localStorage.removeItem("havenox_token");
    } catch (err) {
      console.debug("Local storage unavailable", err);
    }
  }

  function getKaswareProvider() {
    return window.kasware || window.kdx || window.kaspium || null;
  }

  function getMetaMaskProvider() {
    return window.ethereum || null;
  }

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
      const from = walletAddress;
      const sig = await eth.request({
        method: "personal_sign",
        params: [msg, from],
      });
      return sig;
    }
    throw new Error("Unsupported wallet.");
  }

  async function connectWallet() {
    const kas = getKaswareProvider();
    const eth = getMetaMaskProvider();
    if (kas) {
      const accounts = await kas.requestAccounts();
      setAddress(accounts[0]);
      setProvider("Kasware");
      return { address: accounts[0], provider: "Kasware" };
    } else if (eth) {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
      setProvider("MetaMask");
      return { address: accounts[0], provider: "MetaMask" };
    } else {
      throw new Error("No compatible wallet found.");
    }
  }

  function disconnectWallet() {
    setAddress("");
    setProvider("");
    setToken("");
    persistToken(null);
  }

  async function signMessageWithWallet(message, { walletAddress } = {}) {
    if (!provider) throw new Error("No wallet provider connected.");
    return await signMessage(provider, message, walletAddress || address);
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        token,
        TREASURY_ADDRESS,
        FEE_RATE,
        connectWallet,
        disconnectWallet,
        signMessageWithWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
