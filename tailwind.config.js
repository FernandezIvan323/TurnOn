/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f3f6eb",
          100: "#e0e9cd",
          200: "#c5d4a0",
          300: "#a3b86f",
          400: "#82994a",
          500: "#65864a",
          600: "#4a6b3a",
          700: "#3a5530",
          800: "#2c4025",
          900: "#252e19",
        },
        wine: {
          50:  "#FFF5F5",
          100: "#FFE0E0",
          200: "#FFC0C0",
          300: "#e5383b",
          400: "#d32f2f",
          500: "#ba181b",
          600: "#a4161a",
          700: "#660708",
          800: "#4a0506",
          900: "#2e0304",
        },
        // Light surfaces — blanco moderno (fondo y cards #fff)
        paper: {
          50:  "#ffffff",
          100: "#ffffff",
          200: "#f5f5f5",
          300: "#e5e5e5",
          400: "#a3a3a3",
          500: "#737373",
        },
        // Light text — zinc / near-black (no slate azulado)
        ink: {
          50:  "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        obsidian: {
           950: "#0b090a",
           900: "#161a1d",
           800: "#2a2a2d",
           700: "#b1a7a6",
           600: "#c5c0c0",
           500: "#a09c9c",
           400: "#d3d3d3",
           200: "#e6e3e3",
           100: "#f0efef",
           50:  "#f5f3f4",
         },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        // Un poco más marcada para separar cards blancas del fondo blanco
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.02)",
        pop:  "0 10px 25px -10px rgb(15 23 42 / 0.25)",
      },
    },
  },
  plugins: [],
};
