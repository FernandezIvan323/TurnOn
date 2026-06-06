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
        paper: {
          50:  "#fdf9ed",
          100: "#f9f1dd",
          200: "#f0e3c1",
          300: "#e3d2a0",
          400: "#c8b389",
          500: "#a8916b",
        },
        surface: {
          50:  "#f9f1dd",
          100: "#f0e3c1",
          200: "#e3d2a0",
          300: "#c8b389",
        },
        ink: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
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
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
        pop:  "0 10px 25px -10px rgb(15 23 42 / 0.25)",
      },
    },
  },
  plugins: [],
};
