import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",                // ✅ forces relative paths for Netlify
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
