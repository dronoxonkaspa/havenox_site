// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// === CODEx-COMPLIANT SPA CONFIG ===
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // ensures all /tent, /verify, /marketplace, /mints, /escrows routes resolve to index.html
    historyApiFallback: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
