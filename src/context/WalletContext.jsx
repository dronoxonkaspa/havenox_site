// src/context/WalletContext.jsx
import { createContext, useContext, useState } from "react";
import { verifySession } from "../lib/apiClient";

const WalletContext = createContext();

function getStoredToken() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem("havenox_token") || "";
  } catch (err) {
    console.warn("⚠️ Unable to read stored token:", err);
    return "";
  }
}

function persistToken(value) {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem("havenox_token", value);
    } else {
      window.localStorage.removeItem("havenox_token");
    }
  } catch (err) {
    console.warn("⚠️ Unable to persist token:", err);
  }
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
    const metaMask = ethereum.providers.find((p) => p.isMetaMask);
    if (metaMask) return metaMask;
  }
  return ethereum.isMetaMask ? ethereum : undefined;
}

const TREASURY_ADDRESS =
  import.meta.env.VITE_TREASURY_ADDRESS ||
  "kaspa:qpz39pyz2ra8g0jtq7f0x9nrdzrllsenx282k5dqv8kgdmw7hsm9zcguzxr5y";
const FEE_RATE = 0.02; // 2%

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [token, setToken] = useState(() => getStoredToken());

  // 🖋️ Handles signing messages across providers
  async function signMessage(walletType, msg, walletAddress = "") {
    try {
      if (walletType === "Kasware / KDX") {
        const kas = getKaswareProvider();
        if (!kas) throw new Error("Kasware wallet not detected.");
        return await kas.signMessage(msg);
      } else {
        const eth = getMetaMaskProvider();
        if (!eth || !eth.request)
          throw new Error("MetaMask not detected. Please enable it.");
        try {
          return await eth.request({
            method: "personal_sign",
            params: [msg, walletAddress || address],
          });
        } catch (err) {
          console.warn("⚠️ Retrying MetaMask sign (reversed params)", err);
          return await eth.request({
            method: "personal_sign",
            params: [walletAddress || address, msg],
          });
        }
      }
    } catch (err) {
      console.error("❌ signMessage error:", err);
      throw err;
    }
  }

  // 🪪 Secure login and token storage
  async function secureLogin(walletType, currentAddress) {
    try {
      const message = `Sign this message to verify ownership of ${currentAddress} on HavenOx. Nonce:${Date.now()}`;
      const signature = await signMessage(walletType, message, currentAddress);
      const payload = { address: currentAddress, signature, message };

      const data = await verifySession(payload);
      console.log("📥 Backend response:", data);

      if (data.status === "verified" || data.status === "ok") {
        const newToken = data.session_token || "";
        persistToken(newToken);
        setToken(newToken);
        alert("✅ Wallet verified and session created!");
      } else {
        alert("❌ Verification failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ secureLogin error:", err);
      alert("⚠️ Login error: " + err.message);
    }
  }

  // Kasware connection
  async function connectKasware() {
    try {
      const kas = getKaswareProvider();
      if (!kas) throw new Error("Kasware wallet not found.");
      const accounts = await kas.requestAccounts();
      if (!accounts?.length) throw new Error("No Kasware accounts detected.");
      const currentAddress = accounts[0];
      setAddress(currentAddress);
      setProvider("Kasware / KDX");
      await secureLogin("Kasware / KDX", currentAddress);
    } catch (err) {
      alert("⚠️ " + err.message);
    }
  }

  // MetaMask connection
  async function connectMetaMask() {
    try {
      const eth = getMetaMaskProvider();
      if (!eth) throw new Error("MetaMask not found.");
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (!accounts?.length) throw new Error("No MetaMask accounts detected.");
      const currentAddress = accounts[0];
      setAddress(currentAddress);
      setProvider("MetaMask / EVM");
      await secureLogin("MetaMask / EVM", currentAddress);
    } catch (err) {
      alert("⚠️ " + err.message);
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
