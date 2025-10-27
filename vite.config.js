/* eslint-env node */
import { cwd } from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { normaliseBasePath } from "./src/utils/basePath";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), "");
  const base = normaliseBasePath(env.VITE_BASE_PATH || "/");

  return {
    base,
    plugins: [react()],
    build: {
      outDir: "dist",
      assetsDir: "assets",
    },
  };
});
