// src/context/WalletContext.jsx
import { createContext, useContext, useState } from "react";

const WalletContext = createContext();

// ✅ Environment variable fallback
const API_BASE =
  import.meta.env.VITE_API_BASE || "https://drono-guard-bot.onrender.com";
const TREASURY_ADDRESS =
  import.meta.env.VITE_TREASURY_ADDRESS ||
  "kaspa:qpz39pyz2ra8g0jtq7f0x9nrdzrllsenx282k5dqv8kgdmw7hsm9zcguzxr5y";
const FEE_RATE = 0.02; // 2%

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [token, setToken] = useState(
    localStorage.getItem("havenox_token") || ""
  );

  // ---- 🔐 Generic message signer ----
  async function signMessage(walletType, msg) {
    try {
      if (walletType === "Kasware / KDX") {
        const kas = window.kasware || window.kdx || window.kaspium;
        if (!kas) throw new Error("Kasware wallet not detected.");
        const signature = await kas.signMessage(msg);
        console.log("✅ Kasware signature:", signature);
        return signature;
      } else {
        // ✅ MetaMask or EVM compatible signature
        let eth = window.ethereum;
        if (eth?.providers?.length) {
          // 🔍 find the real MetaMask provider among multiple injected wallets
          eth = eth.providers.find((p) => p.isMetaMask) || eth.providers[0];
        }

        if (!eth || !eth.request)
          throw new Error("MetaMask not detected. Please enable it.");

        try {
          const signature = await eth.request({
            method: "personal_sign",
            params: [msg, address],
          });
          console.log("✅ MetaMask signature:", signature);
          return signature;
        } catch (err) {
          console.warn("⚠️ Retrying MetaMask sign (reversed params)");
          const signature = await eth.request({
            method: "personal_sign",
            params: [address, msg],
          });
          console.log("✅ MetaMask signature (reversed):", signature);
          return signature;
        }
      }
    } catch (err) {
      console.error("❌ signMessage error:", err);
      throw err;
    }
  }

  // ---- 🔒 Secure login with backend verification ----
  async function secureLogin(walletType, currentAddress) {
    try {
      const message = `Sign this message to verify ownership of ${currentAddress} on HavenOx. Nonce:${Date.now()}`;
      const signature = await signMessage(walletType, message);

      const payload = { address: currentAddress, signature, message };
      console.log("📤 Sending verification payload:", payload);

      const res = await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Backend response:", data);

      if (data.status === "verified" || data.status === "ok") {
        const newToken = data.session_token || "";
        localStorage.setItem("havenox_token", newToken);
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

  // ---- 🧩 Connect Kasware / KDX / Kaspium ----
  async function connectKasware() {
    try {
      const kas = window.kasware || window.kdx || window.kaspium;
      if (!kas) throw new Error("Kasware wallet not found.");
      const accounts = await kas.requestAccounts();
      if (!accounts?.length) throw new Error("No Kasware accounts detected.");

      const currentAddress = accounts[0];
      setAddress(currentAddress);
      setProvider("Kasware / KDX");

      await new Promise((resolve) => setTimeout(resolve, 100));
      await secureLogin("Kasware / KDX", currentAddress);
    } catch (err) {
      console.error("Kasware connection error:", err);
      alert("Kasware connection failed: " + err.message);
    }
  }

  // ---- 🦊 Connect MetaMask / EVM (multi-provider safe) ----
  async function connectMetamask() {
    try {
      // 🔄 Prevent Kasware interference
      if (window.kasware || window.kdx || window.kaspium) {
        console.log("🔄 Detected Kasware; reloading to reset provider.");
        disconnectWallet();
        window.location.reload();
        return;
      }

      let eth = window.ethereum;
      if (eth?.providers?.length) {
        eth = eth.providers.find((p) => p.isMetaMask) || eth.providers[0];
      }

      if (!eth || !eth.request)
        throw new Error("MetaMask not detected. Please ensure it’s active.");

      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (!accounts?.length) throw new Error("No MetaMask accounts found.");

      const currentAddress = accounts[0];
      setAddress(currentAddress);
      setProvider("MetaMask / EVM");

      await new Promise((resolve) => setTimeout(resolve, 100));
      await secureLogin("MetaMask / EVM", currentAddress);
    } catch (err) {
      console.error("MetaMask connection error:", err);
      alert("MetaMask connection failed: " + err.message);
    }
  }

  // ---- 🚪 Disconnect Wallet ----
  function disconnectWallet() {
    setAddress("");
    setProvider("");
    setToken("");
    localStorage.removeItem("havenox_token");
    window.location.reload();
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        token,
        connectKasware,
        connectMetamask,
        disconnectWallet,
        treasury: TREASURY_ADDRESS,
        feeRate: FEE_RATE,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
