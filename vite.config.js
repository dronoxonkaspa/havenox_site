import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./", // ✅ Important: fixes asset paths on Netlify
  plugins: [react()],
});
