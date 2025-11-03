import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: path.resolve("C:/Users/israe/Projects/havenox-v2/frontend_output"),
    emptyOutDir: true,
    write: true
  }
});
