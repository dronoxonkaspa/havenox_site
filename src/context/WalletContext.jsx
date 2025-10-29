// src/context/WalletContext.jsx
import { createContext, useContext, useState } from "react";
import { verifySession } from "../lib/apiClient";

const WalletContext = createContext();

function getStoredToken() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem("havenox_token") || "";
  } catch {
    return "";
  }
}

function persistToken(value) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem("havenox_token", value);
    else window.localStorage.removeItem("havenox_token");
  } catch {}
}

function getKaswareProvider() {
  if (typeof window === "undefined") return undefined;
  return window.kasware || window.kdx || window.kaspium;
}

function getMetaMaskProvider() {
  if (typeof window === "undefined") return undefined;
  const { ethereum } = window;
  if (!ethereum) return undefined;
  if (ethereum.providers?.length) {
    const mm = ethereum.providers.find((p) => p.isMetaMask);
    if (mm) return mm;
  }
  return ethereum.isMetaMask ? ethereum : undefined;
}

const TREASURY_ADDRESS =
  import.meta.env.VITE_TREASURY_ADDRESS ||
  "kaspa:qpz39pyz2ra8g0jtq7f0x9nrdzrllsenx282k5dqv8kgdmw7hsm9zcguzxr5y";
const FEE_RATE = Number(import.meta.env.VITE_FEE_RATE ?? 0.02);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [token, setToken] = useState(() => getStoredToken());

  // Universal message signer (Kasware/KDX/Kaspium or MetaMask)
  async function signMessage(walletType, msg, walletAddress = "") {
    if (walletType === "Kasware / KDX") {
      const kas = getKaswareProvider();
      if (!kas) throw new Error("Kasware/KDX wallet not detected.");
      if (typeof kas.signMessage === "function") return kas.signMessage(msg);
      if (typeof kas.requestSignature === "function") {
        const r = await kas.requestSignature({ message: msg });
        return r?.signature || r;
      }
      throw new Error("Kasware wallet does not support message signing.");
    } else {
      const eth = getMetaMaskProvider();
      if (!eth?.request) throw new Error("MetaMask not detected.");
      try {
        return await eth.request({
          method: "personal_sign",
          params: [msg, walletAddress || address],
        });
      } catch {
        // Some MM versions require reversed params
        return await eth.request({
          method: "personal_sign",
          params: [walletAddress || address, msg],
        });
      }
    }
  }

  // Verify session with backend and persist token
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

  // Connectors
  async function connectKasware() {
    const kas = getKaswareProvider();
    if (!kas) return alert("Kasware/KDX wallet not found.");
    const accounts = await kas.requestAccounts();
    if (!accounts?.length) return alert("No Kasware accounts detected.");
    const currentAddress = accounts[0];
    setAddress(currentAddress);
    setProvider("Kasware / KDX");
    try {
      await secureLogin("Kasware / KDX", currentAddress);
    } catch (e) {
      alert("⚠️ " + e.message);
    }
  }

  async function connectMetaMask() {
    const eth = getMetaMaskProvider();
    if (!eth) return alert("MetaMask not found.");
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts?.length) return alert("No MetaMask accounts detected.");
    const currentAddress = accounts[0];
    setAddress(currentAddress);
    setProvider("MetaMask / EVM");
    try {
      await secureLogin("MetaMask / EVM", currentAddress);
    } catch (e) {
      alert("⚠️ " + e.message);
    }
  }

  function disconnectWallet() {
    setAddress("");
    setProvider("");
    setToken("");
    persistToken("");
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
        disconnectWallet,
        // exposing signer is handy for pages needing direct sign
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
