import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { WalletProvider } from "./context/WalletContext";
import { ListingsProvider } from "./context/ListingsContext";

function safeInitIntercom() {
  try {
    if (typeof window !== "undefined") {
      if (window.Intercom && typeof window.Intercom === "function") {
        window.Intercom("boot", {
          app_id: "YOUR_APP_ID",
        });
        console.log("✅ Intercom initialized safely.");
      } else {
        console.log("⚠️ Intercom not found – skipping init.");
      }
    }
  } catch (err) {
    console.error("❌ Intercom init error:", err);
  }
}

safeInitIntercom();

const baseUrl = import.meta.env.BASE_URL ?? "/";

function normaliseBase(path) {
  if (!path) return "/";
  if (path === "." || path === "./") return "/";
  try {
    const url = new URL(path, "http://localhost");
    const cleaned = url.pathname.replace(/\/+$/, "");
    return cleaned || "/";
  } catch {
    return path.endsWith("/") ? path.slice(0, -1) || "/" : path;
  }
}

const basename = normaliseBase(baseUrl);

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
 