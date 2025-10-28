// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/", // ✅ Ensures all assets are built for root path
    plugins: [react()],
    build: {
      outDir: "dist",
      assetsDir: "assets",
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
      },
    },
  };
});
