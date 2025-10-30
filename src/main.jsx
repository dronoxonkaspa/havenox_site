import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { WalletProvider } from "./context/WalletContext";
import { ListingsProvider } from "./context/ListingsContext";

/* -------------------------------------------
   Optional: Safe Intercom Init
---------------------------------------------*/
function safeInitIntercom() {
  try {
    if (typeof window !== "undefined" && window.Intercom) {
      window.Intercom("boot", { app_id: "YOUR_APP_ID" });
      console.log("✅ Intercom initialized safely.");
    } else {
      console.log("⚠️ Intercom not found – skipping init.");
    }
  } catch (err) {
    console.error("❌ Intercom init error:", err);
  }
}

safeInitIntercom();

/* -------------------------------------------
   Normalize base URL for BrowserRouter
---------------------------------------------*/
const baseUrl = import.meta.env.BASE_URL ?? "/";
function normalizeBase(path) {
  if (!path || path === "." || path === "./") return "/";
  try {
    const url = new URL(path, "http://localhost");
    const cleaned = url.pathname.replace(/\/+$/, "");
    return cleaned || "/";
  } catch {
    return path.endsWith("/") ? path.slice(0, -1) || "/" : path;
  }
}

const basename = normalizeBase(baseUrl);

/* -------------------------------------------
   Mount React App
---------------------------------------------*/
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <WalletProvider>
        <ListingsProvider>
          <App />
        </ListingsProvider>
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);
