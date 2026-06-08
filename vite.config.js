import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    host: true,
    watch: {
      usePolling: true,
      interval: 800,
      ignored: ["**/server/**", "**/server*.log", "**/*.pid", "**/dist/**"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "zustand", "axios", "lucide-react"],
  },
  build: {
    target: "es2020",
  },
});
