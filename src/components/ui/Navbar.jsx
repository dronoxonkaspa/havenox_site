import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "/src/styles/havenox.css";

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    try {
      if (typeof window === "undefined" || !window.kasware) {
        alert("KasWare wallet not detected. Please install the KasWare browser extension.");
        return;
      }

      const accounts = await window.kasware.request({ method: "kas_requestAccounts" });
      if (accounts && accounts[0]) {
        setWalletAddress(accounts[0]);
      } else {
        alert("No KasWare accounts found.");
      }
    } catch (err) {
      console.error("KasWare connect error:", err);
      alert("Failed to connect wallet. Check KasWare permissions.");
    }
  };

  return (
    <nav className="cyber-navbar">
      <div className="logo">HAVENOX</div>
      <ul>
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/livetent">Live Tent</NavLink></li>
        <li><NavLink to="/createtent">Create Tent</NavLink></li>
      </ul>
      <button className="connect-btn" onClick={connectWallet}>
        {walletAddress ? walletAddress.slice(0,6) + "..." + walletAddress.slice(-4) : "Connect KasWare"}
      </button>
    </nav>
  );
}
