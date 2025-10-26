import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { WalletProvider } from "./context/WalletContext";
import { ListingsProvider } from "./context/ListingsContext";

// Optional: safe Intercom wrapper (won't break render if missing)
function safeInitIntercom() {
  try {
    if (window.Intercom && typeof window.Intercom === "function") {
      window.Intercom("boot", {
        app_id: "YOUR_APP_ID", // Replace with real ID if you want Intercom later
      });
      console.log("✅ Intercom initialized safely.");
    } else {
      console.log("⚠️ Intercom not found – skipping init.");
    }
  } catch (err) {
    console.error("❌ Intercom init error:", err);
  }
}

// Run safely, but doesn’t block React if it fails
safeInitIntercom();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <WalletProvider>
        <ListingsProvider>
          <App />
        </ListingsProvider>
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);
