import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Plain Vite + React SPA: no server-side code runs here, Netlify just
// serves the static build output produced by `vite build`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
