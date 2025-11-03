import { createContext, useContext, useEffect, useState } from "react";
import { verifySession } from "../lib/apiClient";

const WalletContext = createContext();
const SESSION_KEY = "havenox_session";

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [token, setToken] = useState("");
  const [sessionAddress, setSessionAddress] = useState("");
  const [sessionExpiry, setSessionExpiry] = useState(null);

  const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS || "";
  const FEE_RATE = parseFloat(import.meta.env.VITE_FEE_RATE || "0.02");

  // ---------- Session Persistence ----------
  function persistSession(value) {
    try {
      if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
      else localStorage.removeItem(SESSION_KEY);
    } catch (err) {
      console.debug("Local storage unavailable", err);
    }
  }

  // Restore saved session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.token) return;
      if (parsed.expiresAt && Date.now() >= Date.parse(parsed.expiresAt)) {
        persistSession(null);
        return;
      }
      setToken(parsed.token);
      setSessionAddress(parsed.address || "");
      setSessionExpiry(parsed.expiresAt || null);
    } catch (err) {
      console.debug("Unable to restore session", err);
    }
  }, []);

  // ---------- Providers ----------
  function getKaswareProvider() {
    return window.kasware || window.kdx || window.kaspium || null;
  }

  function getMetaMaskProvider() {
    return window.ethereum || null;
  }

  // ---------- Mock Signer for Dev ----------
  function mockSignMessage(message, address) {
    const fakeSig = btoa(`${message}-${address}-${Date.now()}`).slice(0, 128);
    console.log("⚙️ Using mock signature:", fakeSig);
    return fakeSig;
  }

  // ---------- Signing ----------
  async function signMessage(walletType, msg, walletAddress) {
    if (!walletType || !msg) throw new Error("Missing wallet or message.");

    // KasWare
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

    // MetaMask
    if (walletType.includes("MetaMask")) {
      const eth = getMetaMaskProvider();
      if (!eth) throw new Error("MetaMask not detected.");
      const sig = await eth.request({
        method: "personal_sign",
        params: [msg, walletAddress],
      });
      return sig;
    }

    // Mock Provider (dev fallback)
    if (walletType.includes("MockProvider")) {
      return mockSignMessage(msg, walletAddress);
    }

    throw new Error("Unsupported wallet.");
  }

  // ---------- Session Management ----------
  function clearSession() {
    setToken("");
    setSessionAddress("");
    setSessionExpiry(null);
    persistSession(null);
  }

  async function verifyWalletSession(walletProvider, walletAddress) {
    if (!walletProvider) throw new Error("No wallet provider connected.");
    if (!walletAddress) throw new Error("Wallet address required for verification.");

    const message = `HavenOx Session Verification\nAddress: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;
    const signature = await signMessage(walletProvider, message, walletAddress);

    // Send to backend (or mock)
    try {
      const response = await verifySession({
        address: walletAddress,
        message,
        signature,
      });

      const sessionData = {
        token: response?.token || "",
        address: walletAddress,
        provider: walletProvider,
        message,
        expiresAt: response?.expiresAt || null,
        verifiedAt: new Date().toISOString(),
      };

      setToken(sessionData.token);
      setSessionAddress(walletAddress);
      setSessionExpiry(sessionData.expiresAt);
      persistSession(sessionData);

      return sessionData;
    } catch (err) {
      console.warn("Mock verifySession fallback:", err.message);
      const sessionData = {
        token: btoa(walletAddress).slice(0, 24),
        address: walletAddress,
        provider: walletProvider,
        message,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        verifiedAt: new Date().toISOString(),
      };
      setToken(sessionData.token);
      setSessionAddress(walletAddress);
      setSessionExpiry(sessionData.expiresAt);
      persistSession(sessionData);
      return sessionData;
    }
  }

  function sessionIsValid(walletAddress) {
    if (!token || !walletAddress || !sessionAddress) return false;
    if (sessionAddress.toLowerCase() !== walletAddress.toLowerCase()) return false;
    if (!sessionExpiry) return true;
    return Date.now() < Date.parse(sessionExpiry);
  }

  async function ensureSession(walletAddress, walletProvider, force = false) {
    const providerToUse = walletProvider || provider;
    if (!providerToUse) throw new Error("No wallet provider connected.");
    if (!walletAddress) throw new Error("Wallet address required.");
    if (!force && sessionIsValid(walletAddress)) return;
    await verifyWalletSession(providerToUse, walletAddress);
  }

  // ---------- Connect / Disconnect ----------
  async function connectWallet() {
    const kas = getKaswareProvider();
    const eth = getMetaMaskProvider();
    let selectedProvider = "";
    let selectedAddress = "";

    if (kas) {
      const accounts = await kas.requestAccounts();
      selectedAddress = accounts[0];
      selectedProvider = "Kasware";
    } else if (eth) {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      selectedAddress = accounts[0];
      selectedProvider = "MetaMask";
    } else {
      console.warn("⚠️ No wallet detected – using mock provider.");
      selectedProvider = "MockProvider";
      selectedAddress = "kaspa:qmockwalletdev12345";
    }

    setAddress(selectedAddress);
    setProvider(selectedProvider);

    try {
      await ensureSession(selectedAddress, selectedProvider, true);
    } catch (err) {
      clearSession();
      setAddress("");
      setProvider("");
      throw err;
    }

    return { address: selectedAddress, provider: selectedProvider };
  }

  function disconnectWallet() {
    setAddress("");
    setProvider("");
    clearSession();
  }

  async function signMessageWithWallet(message, { walletAddress, walletType } = {}) {
    const signerAddress = walletAddress || address;
    const walletProvider = walletType || provider;

    if (!walletProvider) throw new Error("No wallet provider connected.");
    if (!signerAddress) throw new Error("Wallet address required for signing.");

    await ensureSession(signerAddress, walletProvider);
    return await signMessage(walletProvider, message, signerAddress);
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        token,
        sessionExpiry,
        TREASURY_ADDRESS,
        FEE_RATE,
        connectWallet,
        disconnectWallet,
        signMessageWithWallet,
        verifyWalletSession,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
