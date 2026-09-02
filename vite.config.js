import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "charset-on-js",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (/\.(jsx?|tsx?|css)(\?|$)/.test(req.url || "")) {
            // Intercepta el método setHeader para agregar charset a text/*
            const origSetHeader = res.setHeader.bind(res);
            res.setHeader = function (name, value) {
              if (
                name.toLowerCase() === "content-type" &&
                typeof value === "string" &&
                value.startsWith("text/") &&
                !value.includes("charset")
              ) {
                value = `${value}; charset=utf-8`;
              }
              return origSetHeader(name, value);
            };
          }
          next();
        });
      },
    },
  ],
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
